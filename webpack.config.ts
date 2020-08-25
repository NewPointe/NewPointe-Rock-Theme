import path from 'path';
import webpack from 'webpack';

export default function config(env: any): webpack.Configuration {
    return {
        mode: env || "development",
        devtool: "source-map",
        output: {
            path: path.join(__dirname, "Scripts"),
            filename: "[name].js"
        },
        optimization: {
            minimize: env == "production"
        },
        resolve: {
            // Add `.ts` and `.tsx` as a resolvable extension.
            extensions: [".ts", ".tsx", ".js"]
        },
        module: {
            rules: [
                // all files with a `.ts` or `.tsx` extension will be handled by `ts-loader`
                {
                    test: /\.tsx?$/,
                    loader: "ts-loader"
                }
            ]
        }
    }
}