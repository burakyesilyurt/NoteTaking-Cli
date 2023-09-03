#!/usr/bin/env node
const { input, select, checkbox } = require("@inquirer/prompts");
const { readFile, writeFile } = require("node:fs/promises");
const { join } = require("node:path");

const file_name = join(__dirname, "note.json");

const readJSONFile = async () => {
  try {
    const contents = await readFile(file_name, { encoding: "utf8" });
    return JSON.parse(contents);
  } catch (err) {
    return [];
  }
};

const writeJSONFile = async (notes) => {
    await writeFile(file_name, JSON.stringify(notes, null, 4), "utf8");
  };
  const selectOptions = async () => {
    const selectedAnswer = await select({
        message: "Seçenekler",
        choices: [
          {
            name: "Yeni Not Yaz",
            value: 1,
          },
          {
            name: "Notları Gör",
            value: 2,
          },
          {
            name: "Notları Sil",
            value: 3,
          },
          {
            name: "Çıkış Yap",
            value: 4,
          },
        ],
      });
    return selectedAnswer
};

const noteAdd = async (notes) => {
    const answers = {
        title: await input({ message: "Başlık?" }),
        body: await input({ message: "İçerik?" }),
      };

      const newNote = {
        id:
          notes[notes.length - 1] !== undefined
            ? notes[notes.length - 1].id + 1
            : 1,
        title: answers.title,
        body: answers.body,
      };
      return newNote
};

const allNotes = (notes) => {
    if (notes.length === 0){
        console.error("Gösterilecek Not Yok")
        return
    }
    notes.forEach((note, index) => {
      console.log(
        `${index + 1}: Başlık: ${note.title}\n   İçerik: ${note.body}\n`
      );
    });
  };

const deleteNotes = async (notes) => {
    if (notes.length === 0){
        console.error("Silinecek Not Yok")
        return
    }
  const notesOrder = notes.map((note) => {
    return {
      name: note.title,
      value: note.id,
    };
  });
  const data = await checkbox({
    message: "Silinecek Notlar (space)",
    choices: notesOrder,
  });
  return data
};


const app = async () => {

  let notes = await readJSONFile();

  const Options = {
    ADD_NOTE: 1,
    VIEW_NOTES: 2,
    DELETE_NOTE: 3,
    EXIT: 4,
  };
  do {
   const selectedAnswer = await selectOptions()

   switch (selectedAnswer) {
    case Options.ADD_NOTE:
      const newNote = await noteAdd(notes);
      notes.push(newNote);
      await writeJSONFile(notes);
      break;
    case Options.VIEW_NOTES:
      allNotes(notes);
      break;
    case Options.DELETE_NOTE:
      const noteId = await deleteNotes(notes);
      notes = notes.filter((note) => !noteId.includes(note.id));
      await writeJSONFile(notes);
      break;
    case Options.EXIT:
      return;
    default:
      console.log("Geçersiz seçenek. Lütfen tekrar deneyin.");
  }
  } while (true);
};

app()
