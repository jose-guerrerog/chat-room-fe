import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useUserStore = create(
  persist(
    (set) => ({
      username: '',
      
      setUsername: (name) => set({ username: name }),
      
      initializeUsername: () => {
        set((state) => {
          // Only generate a random name if username is empty
          if (!state.username) {
            const randomName = `User${Math.floor(Math.random() * 1000)}`;
            return { username: randomName };
          }
          return state;
        });
      }
    }),
    {
      name: 'chat-user-storage', // Name for storage key
    }
  )
);

export default useUserStore;