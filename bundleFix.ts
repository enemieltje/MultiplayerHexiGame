const folder = `./src/game/client/`;

// FIXME: plz, i hate dis
class myFile
{
	string: string;
	constructor (file: string)
	{
		this.string = file;
	}

	change ()
	{
		let changes = 0;

		const start = this.string.indexOf("export { ");
		if (start == -1) return 0;

		const slice = this.string.slice(start);
		const end = slice.indexOf(";") + start + 1;
		const subString = this.string.substring(start, end);

		console.log(subString);
		this.string = this.string.replace(subString, "");

		changes += this.change() + 1;
		return changes;
	}
}

function fixFile (fileName: string)
{
	console.log(`fixing string: ${fileName}`);
	const file = new myFile(Deno.readTextFileSync(folder + fileName));

	const changes = file.change();

	Deno.writeTextFileSync(folder + fileName, file.string);
	console.log(`string written, ${changes} changes made`);
}

fixFile("game.bundle.js");
