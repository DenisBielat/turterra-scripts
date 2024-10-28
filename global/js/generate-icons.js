// generate-icons.js
import { readdir, stat, writeFile } from 'fs/promises';
import { join, relative, basename, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

console.log('Current directory:', __dirname);
console.log('Process working directory:', process.cwd());
console.log('Directory contents:', await readdir(process.cwd()));

const rootDir = join(__dirname, '../..'); // Go up to project root
const iconAssetsDir = join(rootDir, 'icons/assets');
const outputPath = join(rootDir, 'icons/css/icons.css');

console.log('Script starting...');
console.log('Root directory:', rootDir);
console.log('Icons assets directory:', iconAssetsDir);
console.log('Output path:', outputPath);

// Check if directories exist
try {
    const iconAssetsStat = await stat(iconAssetsDir);
    console.log('Icons assets directory exists:', iconAssetsStat.isDirectory());
    console.log('Icons assets contents:', await readdir(iconAssetsDir));
} catch (error) {
    console.error('Error checking icons assets directory:', error);
}

async function generateIconCSS(iconRootDir) {
    const css = [];
    
    async function processDirectory(dir, categoryPrefix) {
        console.log('Processing directory:', dir);
        console.log('Category prefix:', categoryPrefix);
        
        const files = await readdir(dir);
        console.log('Found files:', files);
        
        for (const file of files) {
            const fullPath = join(dir, file);
            const stats = await stat(fullPath);
            
            if (stats.isDirectory()) {
                console.log('Found subdirectory:', file);
                const newPrefix = categoryPrefix ? 
                    `${categoryPrefix}-${file}` : 
                    `icon-${file}`;
                await processDirectory(fullPath, newPrefix);
            } else if (file.endsWith('.svg')) {
                console.log('Processing SVG file:', file);
                const iconName = basename(file, '.svg');
                const relativePath = relative(iconRootDir, fullPath).replace(/\\/g, '/');
                const className = categoryPrefix ? 
                    `${categoryPrefix}-${iconName}` : 
                    `icon-${iconName}`;
                
                console.log('Generated class:', className);
                console.log('Relative path:', relativePath);
                
                css.push(`
/* Icon: ${iconName} */
[class*="${className.toLowerCase()}"] {
    --icon-url: url('/icons/${relativePath}');
}`);
            }
        }
    }
    
    try {
        await processDirectory(iconRootDir, '');
        
        // Create the complete CSS with base styles and generated classes
        const outputCSS = `/* Auto-generated icon styles - DO NOT EDIT DIRECTLY */

/* Base icon styles */
.icon,
.icon-before::before,
.icon-after::after {
    display: inline-block;
    background-color: currentColor;
    vertical-align: middle;
    mask-repeat: no-repeat;
    mask-position: center;
    mask-size: contain;
    width: var(--icon-size, 1rem);
    height: var(--icon-size, 1rem);
}

/* Pseudo-element setup */
.icon-before::before,
.icon-after::after {
    content: "";
    mask-image: var(--icon-url);
}

.icon-before::before {
    margin-right: 5px;
}

.icon-after::after {
    margin-left: 5px;
}

/* Size variants */
.icon-xsm {
    --icon-size: .5rem;
}

.icon-sm {
    --icon-size: .875rem;
}

.icon-lg {
    --icon-size: 1.5rem;
}

.icon-xlg {
    --icon-size: 2rem;
}

/* Generated icon classes */
${css.join('\n')}`;
        
        console.log('Writing CSS file to:', outputPath);
        await writeFile(outputPath, outputCSS);
        console.log('Icon CSS generated successfully!');
        console.log('Number of icon classes generated:', css.length);
        
    } catch (error) {
        console.error('Error generating icon CSS:', error);
        console.error('Error details:', error.stack);
    }
}

// Generate CSS using the icon assets directory
console.log('Starting icon CSS generation...');
generateIconCSS(iconAssetsDir)
    .then(() => console.log('Generation complete'))
    .catch(error => console.error('Top level error:', error));
