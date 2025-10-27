// copyAndRename.mjs
import fs from 'fs/promises';
import path from 'path';
import { sendToClient } from './websocket';

import { access } from 'fs/promises';
import { constants } from 'fs';

async function pathExists(path:string) {
  try {
    await access(path, constants.F_OK); // Check existence
    return true;
  } catch {
    return false;
  }
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
	if(!(await pathExists(src)))throw new Error(' src not found');
	const baseName = path.basename(src);
	const reg = new RegExp('old', 'gi');
	if (reg.test(baseName)) return;

	// Remove "Done" from names
	const cleanName = baseName.replace(/done/gi, '').trim();

	if (!cleanName || cleanName === '.' || cleanName === '..') {
		throw new Error('Skipped invalid or empty name: '+ src);
	}
	const destPath = path.join(dest, cleanName);
	console.log(destPath,'  ;;;;;;;;;;;;;;;',baseName,'111111111111', cleanName)
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

export async function runTransfer(srcDir:string[], endDir:string) {
	if (srcDir.length == 0 || !endDir) {
		console.log('1')
		throw new Error(`Src or dest Not Found,  Src: ${srcDir},Dest: ${endDir}`);
	}
	await fs.mkdir(endDir, { recursive: true });
	console.log('2')
	for(const srcDirItem of srcDir){
		console.log('3')
		try{
			console.log('444')
			await copyFiltered(srcDirItem, endDir);
			sendToClient({type:'transfer_status',path:srcDirItem,status:true})
		}catch(err){
			console.log('455544')
			sendToClient({type:'transfer_status',path:srcDirItem,status:false})
		}
	}
	console.log('Transfer complete.');
}
