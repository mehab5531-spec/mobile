import storageService from './storageService';

class SyncService {
  constructor() {
    this.isOnline = true;
    this.isSyncing = false;
    this.syncListeners = [];
  }

  // Add listener for sync status changes
  addSyncListener(listener) {
    this.syncListeners.push(listener);
  }

  removeSyncListener(listener) {
    this.syncListeners = this.syncListeners.filter(l => l !== listener);
  }

  notifyListeners(status) {
    this.syncListeners.forEach(listener => listener(status));
  }

  // Check if device is online
  async checkConnectivity() {
    try {
      const response = await fetch('/api/categories', {
        method: 'HEAD',
        timeout: 5000,
      });
      this.isOnline = response.ok;
      await storageService.setOfflineMode(!this.isOnline);
      return this.isOnline;
    } catch (error) {
      this.isOnline = false;
      await storageService.setOfflineMode(true);
      return false;
    }
  }

  // Initial data sync (first app launch)
  async initialSync() {
    if (this.isSyncing) return { success: false, message: 'Sync already in progress' };
    
    try {
      this.isSyncing = true;
      this.notifyListeners({ type: 'sync_start', message: 'Downloading initial data...' });

      const isOnline = await this.checkConnectivity();
      if (!isOnline) {
        throw new Error('No internet connection');
      }

      // Fetch categories
      this.notifyListeners({ type: 'sync_progress', message: 'Downloading categories...' });
      const categoriesResponse = await fetch('/api/categories');
      if (!categoriesResponse.ok) {
        throw new Error('Failed to fetch categories');
      }
      const { categories } = await categoriesResponse.json();

      // Fetch stories
      this.notifyListeners({ type: 'sync_progress', message: 'Downloading stories...' });
      const storiesResponse = await fetch('/api/stories');
      if (!storiesResponse.ok) {
        throw new Error('Failed to fetch stories');
      }
      const { stories } = await storiesResponse.json();

      // Save to local storage
      this.notifyListeners({ type: 'sync_progress', message: 'Saving data...' });
      await storageService.saveCategories(categories);
      await storageService.saveStories(stories);
      await storageService.setLastSyncTime();

      this.notifyListeners({ 
        type: 'sync_complete', 
        message: `Downloaded ${categories.length} categories and ${stories.length} stories` 
      });

      return { 
        success: true, 
        message: 'Initial sync completed successfully',
        data: { categories, stories }
      };
    } catch (error) {
      console.error('Initial sync failed:', error);
      this.notifyListeners({ 
        type: 'sync_error', 
        message: error.message || 'Sync failed' 
      });
      return { success: false, message: error.message || 'Sync failed' };
    } finally {
      this.isSyncing = false;
    }
  }

  // Incremental sync (check for updates)
  async incrementalSync() {
    if (this.isSyncing) return { success: false, message: 'Sync already in progress' };

    try {
      this.isSyncing = true;
      this.notifyListeners({ type: 'sync_start', message: 'Checking for updates...' });

      const isOnline = await this.checkConnectivity();
      if (!isOnline) {
        throw new Error('No internet connection');
      }

      const lastSync = await storageService.getLastSyncTime();
      const sinceParam = lastSync ? `?since=${lastSync.toISOString()}` : '';

      // Check for updated categories
      this.notifyListeners({ type: 'sync_progress', message: 'Checking categories...' });
      const categoriesResponse = await fetch(`/api/categories${sinceParam}`);
      if (!categoriesResponse.ok) {
        throw new Error('Failed to fetch categories');
      }
      const { categories } = await categoriesResponse.json();

      // Check for updated stories
      this.notifyListeners({ type: 'sync_progress', message: 'Checking stories...' });
      const storiesResponse = await fetch(`/api/stories${sinceParam}`);
      if (!storiesResponse.ok) {
        throw new Error('Failed to fetch stories');
      }
      const { stories } = await storiesResponse.json();

      let updatesFound = false;

      // Merge categories if any updates
      if (categories.length > 0) {
        this.notifyListeners({ type: 'sync_progress', message: 'Updating categories...' });
        await storageService.mergeCategories(categories);
        updatesFound = true;
      }

      // Merge stories if any updates
      if (stories.length > 0) {
        this.notifyListeners({ type: 'sync_progress', message: 'Updating stories...' });
        await storageService.mergeStories(stories);
        updatesFound = true;
      }

      if (updatesFound) {
        await storageService.setLastSyncTime();
        this.notifyListeners({ 
          type: 'sync_complete', 
          message: `Updated ${categories.length} categories and ${stories.length} stories` 
        });
      } else {
        this.notifyListeners({ 
          type: 'sync_complete', 
          message: 'No updates found' 
        });
      }

      return { 
        success: true, 
        message: updatesFound ? 'Updates downloaded successfully' : 'No updates found',
        updatesFound,
        data: { categories, stories }
      };
    } catch (error) {
      console.error('Incremental sync failed:', error);
      this.notifyListeners({ 
        type: 'sync_error', 
        message: error.message || 'Sync failed' 
      });
      return { success: false, message: error.message || 'Sync failed' };
    } finally {
      this.isSyncing = false;
    }
  }

  // Check if sync is needed (weekly check)
  async shouldSync() {
    const lastSync = await storageService.getLastSyncTime();
    if (!lastSync) return true; // First time, need initial sync

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    return lastSync < weekAgo;
  }

  // Auto sync (called on app start)
  async autoSync() {
    const isOnline = await this.checkConnectivity();
    if (!isOnline) {
      return { success: false, message: 'Offline mode' };
    }

    const needsSync = await this.shouldSync();
    if (!needsSync) {
      return { success: true, message: 'No sync needed' };
    }

    // Check if we have any data
    const categories = await storageService.getCategories();
    const stories = await storageService.getStories();

    if (categories.length === 0 || stories.length === 0) {
      return await this.initialSync();
    } else {
      return await this.incrementalSync();
    }
  }

  // Manual sync (pull to refresh)
  async manualSync() {
    return await this.incrementalSync();
  }

  // Get sync status
  getSyncStatus() {
    return {
      isOnline: this.isOnline,
      isSyncing: this.isSyncing,
    };
  }
}

export default new SyncService();