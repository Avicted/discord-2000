export class Queue<T> {
    _store: T[] = []

    push(val: T) {
        this._store.push(val)
    }

    pop(): T | undefined {
        return this._store.shift()
    }

    length(): number {
        return this._store.length
    }

    clear(): void {
        for (let i = 0; i < this.length(); i++) {
            this._store.pop()
        }
    }
}
