const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const devBuild = process.env.NODE_ENV === 'dev';

module.exports = [
    {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: [
            { loader: 'ts-loader' },
            {
                loader: 'tslint-loader',
                options: {
                    typeCheck: true
                }
            }
        ]
    },
    {
        test: /\.css$/,
        use: [
            devBuild ? 'style-loader' : MiniCssExtractPlugin.loader,
            'css-loader'
        ]
    },
    {
        test: /index.html$/,
        loader: 'raw-loader'
    }
];
