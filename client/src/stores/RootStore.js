import RecipeStore from './RecipeStore';
import MealPlanStore from './MealPlanStore';
import InventoryStore from './InventoryStore';
import HealthStore from './HealthStore';
import UserStore from './UserStore';

class RootStore {
  constructor() {
    this.recipeStore = RecipeStore;
    this.mealPlanStore = MealPlanStore;
    this.inventoryStore = InventoryStore;
    this.healthStore = HealthStore;
    this.userStore = UserStore;
  }
}

export const rootStore = new RootStore();

// Export individual stores for convenience
export const {
  recipeStore,
  mealPlanStore,
  inventoryStore,
  healthStore,
  userStore
} = rootStore; 
