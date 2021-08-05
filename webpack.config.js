const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin'); // работа с html и шаблонами
const MiniCssExtractPlugin = require('mini-css-extract-plugin'); // минификация и запись в файлы css
const { CleanWebpackPlugin } = require('clean-webpack-plugin'); // чистка выходной директории
const OptimizeCssAssetWebpackPlugin = require('optimize-css-assets-webpack-plugin'); // 
const TerserWebpackPlugin = require('terser-webpack-plugin'); // 
const PATHS = {
    source: path.join(__dirname, 'src'),
    build: path.join(__dirname, 'dist')
}
// режим работы: build или dev или comps (process.env.NODE_ENV получить системную переменную ОС NODE_ENV)
const isDev = (process.env.NODE_ENV === 'development'); 
const isProd = (process.env.NODE_ENV === 'production'); 

console.log('isDev = ', isDev);
console.log('isProd = ', isProd);

/**
 * Оптимизирует сборку в режиме production
 */
const optimization = () => { // правила для оптимизации (минификации) в зависимости от режима сборки
    const config = {
                        splitChunks:{
                            chunks:'all'// какие фрагменты будут выбраны для оптимизации
                        }
                    };
    if(isProd){
        config.minimizer = [
            new OptimizeCssAssetWebpackPlugin(),
            new TerserWebpackPlugin()
        ]
    }
    return config;
};

/**
 * возвращает точки входа в зависимости от режима сборки
 * isDev || isProd == сборка всех страниц проекта и его дополнительных точек входа
 */
function getEntry(){
    if(isDev || isProd) return {
        'index': PATHS.source + '/index.js'
    };
}
/**
 * Возвращает набор плагинов в зависимости от режима сборки (isDev,isProd,isComps)
 */
function getPlugin(){
    if(isDev || isProd) return [
        new HtmlWebpackPlugin({ // передача плагину шаблона pug == написать функцию для вставки страниц!!!
            filename: 'index.html',
            chunks: ['index'],
            inject: true,
            template: PATHS.source + '/index.pug'
        }),
        new CleanWebpackPlugin(), // чистит pruduction директорию перед новой сборкой
        new MiniCssExtractPlugin({ // сохранение css в файлы
            filename: 'css/[name].css'
        })
    ];
}

module.exports = {
    context: path.resolve(__dirname, './src'),
    entry: getEntry(),
    output:{ // шаблон имен и местоположение для выходных файлов
        filename: 'app/[name].js',
        path: PATHS.build
    },
    devServer:{
        port: 4200,
        hot: false // isDev
    },
    optimization: optimization(),
    devtool: isDev ? 'source-map': 'nosources-source-map', // включение source-map в режиме разработки
    // в режиме build с isDev===false перестает правильно работать resolve-url-loader
    // при включении devtool:'source-map' resolve-url-loader работает правильно
    plugins: getPlugin(),
    module:{ // loaders
        rules: [
            { // Pug
                test: /\.pug$/,
                loader: 'pug-loader',
                options: {
                    pretty: true
                }
            },
            { // SASS, SCSS
                test: /\.s[ac]ss$/,
                use:[
                    {
                        loader: MiniCssExtractPlugin.loader,
                        options:{
                            publicPath: '../', 
                            hmr: isDev, // Hot Module Replacement - разрешает горячую замену (для watch), нужна в режиме разработки
                            reloadAll: true
                        }
                    },
                    'css-loader',
                    {
                        loader: 'resolve-url-loader',
                        options:{
                            sourceMap: isDev,  // для использования карт
                            removeCR: true
                        }
                    },
                    'sass-loader'
                ] 
            },
            { // Images
                test: /\.(png|jpg|svg|gif)$/,
                // use:['file-loader'],
                loader: 'file-loader',
                options:{
                    outputPath: 'img',
                    name: '[name].[ext]'
                }
            },
            { // Images
                test: /favicon.ico$/,
                // use:['file-loader'],
                loader: 'file-loader',
                options:{
                    outputPath: './',
                    name: '[name].[ext]'
                }
            },
            { // правило для подключения шрифтов
                test: /\.(ttf|woff|woff2|eot)$/,
                // use:['file-loader']
                loader: 'file-loader',
                options:{
                    outputPath: 'fonts',
                    name: '[name].[ext]'
                }
            },
            { // правило для подключения php
                test: /\.(php)$/,
                loader: 'file-loader',
                options:{
                    name: '[name].[ext]'
                }
            }

        ]
    }
}