// copyAndRename.mjs
import fs from 'fs/promises';
import path from 'path';

const [,, srcDir, endDir] = process.argv;

if (!srcDir || !endDir) {
	console.error('Usage: node copyAndRename.mjs <srcDir> <endDir>');
	process.exit(1);
}


async function hasPdf(folder:string) {
	try {
		const items = await fs.readdir(folder, { withFileTypes: true });
		return items.some(item => item.isFile() && item.name.toLowerCase().endsWith('.pdf'));
	} catch {
		return false;
	}
}

async function copyFiltered(src:string, dest:string) {
	const baseName = path.basename(src);
	const reg = new RegExp('old', 'gi');
	if (reg.test(baseName)) return;

	// Remove "Done" from names
	const cleanName = baseName.replace(/done/gi, '').trim();

	if (!cleanName || cleanName === '.' || cleanName === '..') {
		console.warn('Skipped invalid or empty name:', src);
		return;
	}
	const destPath = path.join(dest, cleanName);

	const stat = await fs.lstat(src);
	if (stat.isDirectory()) {
		await fs.mkdir(destPath, { recursive: true });
		const items = await fs.readdir(src);
		for (const item of items) {
			await copyFiltered(path.join(src, item), destPath);
		}

		const hasPdfInFolder = await hasPdf(src);
		if (!hasPdfInFolder) {
			const oldPath = path.join(src, 'OLD');
			try {
				const oldItems = await fs.readdir(oldPath, { withFileTypes: true });
				for (const item of oldItems) {
					if (item.isFile() && item.name.toLowerCase().endsWith('.pdf')) {
						const from = path.join(oldPath, item.name);
						const to = path.join(destPath, item.name);
						await fs.copyFile(from, to);
						console.log(`Copied missing PDF from: ${from}`);
					}
				}
			} catch (err) {
				console.warn(`No OLD folder or PDF inside for: ${src}`);
			}
		}
	} else {
		await fs.copyFile(src, destPath);
	}
}

async function run() {
	await fs.mkdir(endDir, { recursive: true });
	const items = await fs.readdir(srcDir);
	for (const item of items) {
		const from = path.join(srcDir, item);
		await copyFiltered(from, endDir);
	}
	console.log('Transfer complete.');
}

run().catch(err => {
	console.error('Error:', err);
	process.exit(1);
});
