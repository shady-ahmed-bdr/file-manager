import fs from 'fs/promises';
import path from 'path';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const [,, caseListFile, originalRoot, modifiedRoot] = process.argv;


const C = console.log


if (!caseListFile || !originalRoot || !modifiedRoot) {
	console.error('Usage: node syncCaseFolders.mjs <caseList.txt> <originalRoot> <modifiedRoot>');
	process.exit(1);
}

async function readCaseNumbers(filePath:string) {
	const raw = await fs.readFile(filePath, 'utf-8');
	return raw.split(/\r?\n/).map(line => line.trim()).filter(line => line);
}

async function hasPdf(folder:string) {
	try {
		const items = await fs.readdir(folder, { withFileTypes: true });
		return items.some(item => item.isFile() && item.name.toLowerCase().endsWith('.pdf'));
	} catch {
		return false;
	}
}

const sameV:string[] = [];
async function syncFolder(src:string, dest:string,caseNum:string) {
	const base = path.basename(src);
	const regex = new RegExp('old','gi')
	const Reg0000 = new RegExp('0000', 'g')
	if (Reg0000.test(base)) return; // ✅ Skip 0000 folders
	if (regex.test(base)) return; // ✅ Skip OLD folders
	C('Updating: ',src)
	const stat = await fs.lstat(src);
	const destExists = await fs.access(dest).then(() => true).catch(() => false);
	if (!stat.isDirectory() && destExists) {
		const destItem = await fs.lstat(dest)
		if (Math.floor(stat.mtimeMs/ 1000) === Math.floor(destItem.mtimeMs/ 1000)) {
			if (!sameV.find((d)=>d==caseNum)) sameV.push(caseNum);
			return;
		}
		C('found a match', caseNum, src);
	}
	if (stat.isDirectory()) {
		await fs.mkdir(dest, { recursive: true });
		const items = await fs.readdir(src);
		for (const item of items) {
			await syncFolder(path.join(src, item), path.join(dest, item),caseNum);
		}
		const hasPdfInFolder = await hasPdf(dest);
		if (!hasPdfInFolder) {
			const oldPath = path.join(src, 'old');
			try {
				const oldItems = await fs.readdir(oldPath, { withFileTypes: true });
				for (const item of oldItems) {
					if (item.isFile() && item.name.toLowerCase().endsWith('.pdf')) {
						C(oldItems)
						const from = path.join(oldPath, item.name);
						const to = path.join(dest, item.name);
						await fs.copyFile(from, to);
						C(`Copied missing PDF from: ${caseNum}`);
					}
				}
			} catch (err) {
				console.warn(`No OLD folder or PDF inside for: ${src}`);
			}
		}
	} else {
		try {
			await fs.copyFile(src, dest);
		} catch (err) {
			console.warn(`Failed to copy ${src} → ${dest}:`, err);
		}
	}
}

async function main() {
	let cases = await readCaseNumbers(caseListFile);
	const items = await fs.readdir(originalRoot);
	let len  = 1
	const total = items.length
	let notFound = [];
	for (const item of items) {
		C(cases, 'on Patch:', item,' (', len,'/',total,')');
		notFound = [];
		for (const caseNum of cases) {
			const srcFolderitem = path.join(originalRoot, item);
			const srcFolder = path.join(srcFolderitem, `${caseNum} Done`);
			const destFolder = path.join(modifiedRoot, caseNum);
			const srcExists = await fs.access(srcFolder).then(() => true).catch(() => false);
			const destExists = await fs.access(destFolder).then(() => true).catch(() => false);
			if (!srcExists || !destExists) {
				console.warn(`Skipping case ${caseNum} → source or destination not found on patch ${item}.`);
				notFound.push(caseNum);
			}else{
				C()
				C(`Syncing case ${caseNum}... on Patch: ${item}`);
				await syncFolder(srcFolder, destFolder,caseNum);
			}
		}
		
		if(total == len) {
			C(notFound,'- not found', sameV, ' - same files with no updates')
			const __filename = fileURLToPath(import.meta.url);
    		const __dirname = dirname(__filename);
			const date = new Date().toISOString().replace(/[:]/g, '-'); // e.g., "2025-07-25T13-35-27.000Z"
			C('saving file in: ',`/log/${date}-log.txt`)
			const loc = path.join(__dirname, `log/${date}-log.txt`);
			fs.writeFile(loc,'not found: ' +notFound.toString().replaceAll(',','\n')+'\n'+'same file with no updates: '+ sameV.toString().replaceAll(',','\n'))
		}
		cases = notFound;
		notFound = []
		len++;
		C()
	}
	C('✅ Sync complete.');
}

main().catch(err => {
	console.error('❌ Error:', err.message);
	process.exit(1);
});
