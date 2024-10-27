// generate-icons.js
import { readdir, stat, writeFile } from 'fs/promises';
import { join, relative, basename } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

async function generateIconCSS(iconRootDir) {
    const css = [];
    
    async function processDirectory(dir, categoryPrefix) {
        const files = await readdir(dir);
        
        for (const file of files) {
            const fullPath = join(dir, file);
            const stats = await stat(fullPath);
            
            if (stats.isDirectory()) {
                // Process subdirectories (ui/filled, ui/line, illustrative/color, etc.)
                const newPrefix = categoryPrefix ? 
                    `${categoryPrefix}-${file}` : 
                    `icon-${file}`;
                await processDirectory(fullPath, newPrefix);
            } else if (file.endsWith('.svg')) {
                const iconName = basename(file, '.svg');
                const relativePath = relative(iconRootDir, fullPath).replace(/\\/g, '/');
                const className = categoryPrefix ? 
                    `${categoryPrefix}-${iconName}` : 
                    `icon-${iconName}`;
                
                // Generate the CSS class
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
        
        // Write to the icons directory so it's included in Vercel static deployment
        await writeFile(join(iconRootDir, '../icons.css'), outputCSS);
        console.log('Icon CSS generated successfully!');
        
    } catch (error) {
        console.error('Error generating icon CSS:', error);
    }
}

// Assuming your icons are in the /icons/assets directory
generateIconCSS(join(__dirname, 'icons', 'assets'));
