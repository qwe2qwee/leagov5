import { Car } from "@/types/CardTypes";
import { create } from "zustand";

interface CarDetailsState {
  selectedCar: Car | null;
  isLoading: boolean;
  error: string | null;
}

interface CarDetailsActions {
  setSelectedCar: (car: Car) => void;
  clearSelectedCar: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export type CarDetailsStore = CarDetailsState & CarDetailsActions;

const initialState: CarDetailsState = {
  selectedCar: null,
  isLoading: false,
  error: null,
};

const useCarDetailsStore = create<CarDetailsStore>((set, get) => ({
  // State
  ...initialState,

  // Actions
  setSelectedCar: (car: Car) => {
    console.log("[CarDetailsStore] Setting selected car:", car.id);
    set({
      selectedCar: car,
      error: null, // Clear any previous errors
    });
  },

  clearSelectedCar: () => {
    console.log("[CarDetailsStore] Clearing selected car");
    set({
      selectedCar: null,
      error: null,
    });
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },

  setError: (error: string | null) => {
    set({
      error,
      isLoading: false, // Stop loading when error occurs
    });
  },

  reset: () => {
    console.log("[CarDetailsStore] Resetting store to initial state");
    set(initialState);
  },
}));

export default useCarDetailsStore;
