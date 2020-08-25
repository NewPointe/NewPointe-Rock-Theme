'use strict';

import { FSWatcher, promises as fsp } from 'fs';
import path from 'path';

import gulp from 'gulp';
import del from 'del';
// import sourcemaps from 'gulp-sourcemaps';
import webpack from 'webpack';
import webpackStream from 'webpack-stream';
import named from 'vinyl-named';
import gulp_sass from 'gulp-sass';
import node_sass from 'node-sass';
import gulp_zip from 'gulp-zip';
import { prompt } from 'enquirer';

import webpackConfig from './webpack.config';

(gulp_sass as any).compiler = node_sass;

const THEME_FILE_NAME = "NewPointe2020";

// ============================== //
//             Utils              //
// ============================== //

/** Array of functions to run on quit. */
const exitHandlers = new Set<() => Promise<void> | void>();

/**
 * Registers a function to be run when the proccess is quit.
 * Usefull for stopping and cleaning up watch tasks/servers.
 * @param handler
 */
function onExit(handler: () => Promise<void> | void) {
    exitHandlers.add(handler);
}

// On Ctrl-C cleanup and exit
process.on('SIGINT', async () => {

    // Give them 2 seconds before forcibly quiting
    setTimeout(() => process.exit(130), 2000);

    // Notify all handlers
    for (const h of exitHandlers) await h();

});

/**
 * Closes the given watcher when the proccess is quit
 * @param watcher The watcher to close
 */
async function closeOnExit(watcher: FSWatcher) {
    return new Promise((resolve) => onExit(() => resolve(watcher.close())));
}

async function waitOnStream(stream: NodeJS.ReadWriteStream) {
    return new Promise((resolve, reject) => stream.on("end", resolve).on("error", reject));
}

async function searchForRock(): Promise<string | null> {
    const response: { themedir: string } = await prompt({
        type: "input",
        name: "themedir",
        message: "Enter the path to the RockWeb/Themes folder you want to link"
    });
    if (response.themedir != null && response.themedir.trim() != "") {
        return response.themedir;
    }
    return null;
}


// ============================== //
//             Tasks              //
// ============================== //

/**
 * Cleans the build folders
 */
export function clean() {
    return del("./build/*");
}
clean.description = "Cleans the build folders";

/**
 * Compiles TypeScript files using webpack
 * @param watch If webpack should watch the files
 */
function compile_typescript(watch = false, env = "development") {
    return gulp.src("./Scripts/main.ts")
        .pipe(named())
        .pipe(webpackStream({ watch, ...webpackConfig(env) }, webpack as any))
        .pipe(gulp.dest('./Scripts/'))
        .pipe(gulp.dest('./build/theme/Scripts/'));
}

/**
 * Compiles TypeScript files
 */
export function typescript() {
    return compile_typescript(false);
}
typescript.description = "Compiles TypeScript files";

/**
 * Compiles TypeScript files
 */
export function typescriptProd() {
    return compile_typescript(false, "production");
}
typescriptProd.description = "Compiles TypeScript files";

/**
 * Compiles sass files
 */
export function copyStyles() {
    return gulp.src("./Styles/**/*")
        .pipe(gulp.dest("./build/theme/Styles"));
}
copyStyles.description = "Copies less styles";

/**
 * Copies static assets
 */
export function copyAssets() {
    return gulp.src("./Assets/**/*")
        .pipe(gulp.dest("./build/theme/Assets"));
}
copyAssets.description = "Copies static assets";

/**
 * Copies layout files
 */
export function copyLayouts() {
    return gulp.src("./Layouts/**/*")
        .pipe(gulp.dest("./build/theme/Layouts"));
}
copyLayouts.description = "Copies layout files";

/**
 * Copies files
 */
export const copy = gulp.parallel(copyStyles, copyAssets, copyLayouts);
copy.description = "Copies files";

/**
 * Builds all files
 */
export const build = gulp.parallel(copy, typescript);
build.description = "Builds all files";

/**
 * Builds all files
 */
export const buildProd = gulp.parallel(copy, typescriptProd);
buildProd.description = "Builds all files";

/**
 * Packages the theme into a Rock plugin
 */
export async function packageTheme() {
    await waitOnStream(gulp.src("./build/theme/**/*").pipe(gulp.dest(`./build/package/content/Themes/${THEME_FILE_NAME}/`)));
    await waitOnStream(gulp.src("./build/package/**/*").pipe(gulp_zip(`./build/${THEME_FILE_NAME}.plugin`)).pipe(gulp.dest(".")));
    console.log(`Exported plugin to '${path.resolve(`./build/${THEME_FILE_NAME}.plugin`)}'`);
}
packageTheme.description = "Packages the theme into a Rock plugin";

/**
 * Links the theme into a local Rock instance for development.
 */
export async function link() {
    const folderToLink = await searchForRock();
    if (folderToLink == null) {
        console.warn("No folder selected, aborting link.");
    }
    else {
        console.warn(`Linking folder '${folderToLink}'`);
        try {
            await fsp.symlink(path.resolve("."), path.join(folderToLink, THEME_FILE_NAME), 'junction');
        }
        catch (e) {
            console.error(`Failed to create symlink: ${e.message}`);
            console.error(e);
        }
    }
}
link.description = "Links the theme into a local Rock instance for development.";

// ============================== //
//            Watchers            //
// ============================== //

/**
 * Watches TypeScript files
 */
export function watchTypescript() {
    return compile_typescript(true);
}
watchTypescript.description = "Watches TypeScript files";


/**
 * Compiles sass files
 */
export function watchStyles() {
    return closeOnExit(gulp.watch("./Styles/**/*", copyStyles));
}
watchStyles.description = "Watches less styles";

/**
 * Copies static assets
 */
export function watchAssets() {
    return closeOnExit(gulp.watch("./Assets/**/*", copyAssets));
}
watchAssets.description = "Watches static assets";

/**
 * Copies layout files
 */
export function watchLayouts() {
    return closeOnExit(gulp.watch("./Layouts/**/*", copyLayouts));
}
watchLayouts.description = "Watches layout files";

/**
 * Watches static files
 */
export const watchStatic = gulp.parallel(watchStyles, watchAssets, watchLayouts);
watchStatic.description = "Watches static files";

/**
 * Watches all files
 */
export const watch = gulp.parallel(watchTypescript, watchStatic);
watch.description = "Watches all files";


// ============================== //
//             Default            //
// ============================== //

const defaultTask = gulp.series(clean, build);
defaultTask.description = "Builds and packages the app";
export default defaultTask;
