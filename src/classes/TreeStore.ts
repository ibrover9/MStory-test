// TreeStore на TypeScript
interface Item {
  id: string | number;
  parent: string | number | null;
  label: string;
  [key: string]: any;
}

class TreeStore {
  private items: Item[];
  private itemMap: Map<string | number, Item>;
  private parentMap: Map<string | number | null, Item[]>;

  constructor(items: Item[]) {
    this.items = items;
    this.itemMap = new Map();
    this.parentMap = new Map();
    this._initializeMaps();
  }

  private _initializeMaps(): void {
    this.items.forEach((item) => {
      const { id, parent } = item;
      this.itemMap.set(id, item);

      if (!this.parentMap.has(parent)) {
        this.parentMap.set(parent, []);
      }
      this.parentMap.get(parent)!.push(item);
    });
  }

  getAll(): Item[] {
    return [...this.items];
  }

  getItem(id: string | number): Item | null {
    return this.itemMap.get(id) || null;
  }

  getChildren(id: string | number | null): Item[] {
    return this.parentMap.get(id) || [];
  }

  getAllChildren(id: string | number): Item[] {
    const result: Item[] = [];
    const stack: Item[] = [...this.getChildren(id)];

    while (stack.length) {
      const current = stack.pop()!;
      result.push(current);
      stack.push(...this.getChildren(current.id));
    }

    return result;
  }

  getAllParents(id: string | number): Item[] {
    const result: Item[] = [];
    let current = this.getItem(id);

    while (current && current.parent !== null) {
      current = this.getItem(current.parent);
      if (current) result.push(current);
    }

    return result.reverse();
  }

  addItem(item: Item): void {
    if (!item || item.id == null) return;
    this.items.push(item);
    this.itemMap.set(item.id, item);

    if (!this.parentMap.has(item.parent)) {
      this.parentMap.set(item.parent, []);
    }
    this.parentMap.get(item.parent)!.push(item);
  }

  removeItem(id: string | number): void {
    const toRemove = this.getAllChildren(id).map((item) => item.id);
    toRemove.push(id);

    this.items = this.items.filter((item) => !toRemove.includes(item.id));
    toRemove.forEach((itemId) => {
      this.itemMap.delete(itemId);
    });

    for (const [parent, children] of this.parentMap.entries()) {
      this.parentMap.set(
        parent,
        children.filter((child) => !toRemove.includes(child.id))
      );
    }
  }

  updateItem(updatedItem: Item): void {
    this.removeItem(updatedItem.id);
    this.addItem(updatedItem);
  }
}

export default TreeStore;
