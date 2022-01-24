import { ItemUpdates } from 'renderer/renderer';
import uuid from 'uuid';
import InventoryItem from './InventoryItem';

const nameSpace = 'ce99923f-9be4-427e-b2dd-c4524509d3cf';

function parseRow(row: string) {
  // Copied from:
  // https://www.geeksforgeeks.org/how-to-convert-csv-to-json-file-having-comma-separated-values-in-node-js/
  let processedString = '';
  let isInQuote = false;

  row.split('').forEach((char) => {
    let processedCharacter = char;

    if (processedCharacter === '"' && !isInQuote) {
      isInQuote = true;
    } else if (processedCharacter === '"' && isInQuote) {
      isInQuote = false;
    }

    if (processedCharacter === ',' && !isInQuote) {
      processedCharacter = '|';
    }

    if (char !== '"') {
      processedString += processedCharacter;
    }
  });

  return processedString.split('|');
}

// TODO: Disallow input of '"' characters in the UI
class InventoryManager {
  items: Array<InventoryItem> = [];

  categories: Set<string> = new Set();

  locations: Set<string> = new Set();

  seed(rows: Array<string>) {
    rows.forEach((row) => {
      const parsedRow = parseRow(row);

      const item = new InventoryItem({
        id: parsedRow[0],
        name: parsedRow[1],
        serialNumber: parsedRow[2],
        category: parsedRow[3],
        description: parsedRow[4],
        location: parsedRow[5],
        dateAquired: parsedRow[6],
        dateRelinquished: parsedRow[7],
        notes: parsedRow[8],
      });

      this.items.push(item);
      this.categories.add(item.category);
      this.locations.add(item.location);
    });
  }

  createNewItem() {
    // See https://github.com/uuidjs/uuid
    const id = uuid(Date.now().toString(), nameSpace);
    const newItem = new InventoryItem({ id, name: '' });

    this.items.push(newItem);

    return newItem;
  }

  updateItem(itemUpdates: ItemUpdates) {
    const toUpdate = this.items.find((itm) => itm.id === itemUpdates.id);

    Object.keys(itemUpdates)
      .filter((k) => k !== 'id')
      .forEach((attr) => {
        toUpdate[attr] = itemUpdates[attr]
      });

    if (Object.keys(itemUpdates).includes('location') && itemUpdates.location) {
      this.locations.add(itemUpdates.location);
    }

    if (Object.keys(itemUpdates).includes('category') && itemUpdates.category) {
      this.categories.add(itemUpdates.category);
    }
  }

  deleteItem(itemId: string) {
    this.items = this.items.filter((itm) => itm.id !== itemId);
  }
}

export default InventoryManager;
