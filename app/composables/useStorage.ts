import { Capacitor } from '@capacitor/core'
import { CapgoCapacitorDataStorageSqlite } from '@capgo/capacitor-data-storage-sqlite'

export class StorageAdapter {
    private static instance: StorageAdapter
    private isNative: boolean
    private storeName: string
    private initialized: boolean = false

    private constructor() {
        this.isNative = Capacitor.isNativePlatform()
        this.storeName = 'comfaca_credito_storage'
    }

    static getInstance(): StorageAdapter {
        if (!StorageAdapter.instance) {
            StorageAdapter.instance = new StorageAdapter()
        }
        return StorageAdapter.instance
    }

    private async initialize() {
        if (this.initialized) return

        if (this.isNative) {
            try {
                await CapgoCapacitorDataStorageSqlite.openStore({ database: this.storeName })
                this.initialized = true
            } catch (error) {
                console.error('Error initializing SQLite storage:', error)
                throw error
            }
        } else {
            this.initialized = true
        }
    }

    async getItem(key: string): Promise<string | null> {
        await this.initialize()

        if (this.isNative) {
            try {
                const result = await CapgoCapacitorDataStorageSqlite.get({ key })
                return result.value || null
            } catch (error) {
                console.error('Error getting item from SQLite:', error)
                return null
            }
        } else {
            try {
                return localStorage.getItem(key)
            } catch (error) {
                console.error('Error getting item from localStorage:', error)
                return null
            }
        }
    }

    async setItem(key: string, value: string): Promise<void> {
        await this.initialize()

        if (this.isNative) {
            try {
                await CapgoCapacitorDataStorageSqlite.set({ key, value })
            } catch (error) {
                console.error('Error setting item in SQLite:', error)
                throw error
            }
        } else {
            try {
                localStorage.setItem(key, value)
            } catch (error) {
                console.error('Error setting item in localStorage:', error)
                throw error
            }
        }
    }

    async removeItem(key: string): Promise<void> {
        await this.initialize()

        if (this.isNative) {
            try {
                await CapgoCapacitorDataStorageSqlite.remove({ key })
            } catch (error) {
                console.error('Error removing item from SQLite:', error)
                throw error
            }
        } else {
            try {
                localStorage.removeItem(key)
            } catch (error) {
                console.error('Error removing item from localStorage:', error)
                throw error
            }
        }
    }

    async clear(): Promise<void> {
        await this.initialize()

        if (this.isNative) {
            try {
                await CapgoCapacitorDataStorageSqlite.clear()
            } catch (error) {
                console.error('Error clearing SQLite storage:', error)
                throw error
            }
        } else {
            try {
                localStorage.clear()
            } catch (error) {
                console.error('Error clearing localStorage:', error)
                throw error
            }
        }
    }

    async keys(): Promise<string[]> {
        await this.initialize()

        if (this.isNative) {
            try {
                const result = await CapgoCapacitorDataStorageSqlite.keys()
                return result.keys || []
            } catch (error) {
                console.error('Error getting keys from SQLite:', error)
                return []
            }
        } else {
            try {
                const keys: string[] = []
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i)
                    if (key) keys.push(key)
                }
                return keys
            } catch (error) {
                console.error('Error getting keys from localStorage:', error)
                return []
            }
        }
    }

    async close(): Promise<void> {
        if (this.isNative && this.initialized) {
            try {
                await CapgoCapacitorDataStorageSqlite.closeStore({ database: this.storeName })
                this.initialized = false
            } catch (error) {
                console.error('Error closing SQLite storage:', error)
            }
        }
    }
}

export const storage = StorageAdapter.getInstance()
