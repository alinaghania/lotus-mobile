export const mealOptions = {
  breakfast: [
    'Oatmeal','Pancakes','Yogurt','Smoothie','Eggs','Avocado Toast','Granola','Fruit Salad','Bagel','Cereal','French Toast','Croissant','Muffin','Waffles','Breakfast Burrito','Chia Pudding','Protein Shake','Coffee','Tea','Fruit','Other'
  ],
  lunch: [
    'Salad','Sandwich','Soup','Pasta','Rice Bowl','Quinoa Bowl','Burger','Sushi','Wrap','Tacos','Burrito','Grilled Chicken','Stir Fry','Pizza Slice','Falafel','Poke Bowl','Curry','Panini','Bagel Sandwich','Ramen','Other'
  ],
  dinner: [
    'Steak','Grilled Chicken','Fish','Seafood','Curry','Stir Fry','Pizza','Pasta','Vegetable Mix','Stew','Tacos','Burrito','Risotto','Lasagna','BBQ Ribs','Veggie Burger','Chili','Sushi','Paella','Quiche','Other'
  ]
};

export const snackOptions = [
  'Fruit','Nuts','Granola Bar','Yogurt','Smoothie','Cookies','Chips','Dark Chocolate','Popcorn','Protein Shake','Other'
];

export const coffeeTypes = [
  'Espresso','Americano','Cappuccino','Latte','Flat White','Mocha','Matcha','Decaf','Other'
];

export const drinkTypes = [
  'Soda', 'Alcohol', 'Mocktail', 'Juice', 'Water', 'Energy Drink', 'Smoothie', 'Tea', 'Coffee', 'Other'
];

export const sportActivities = [
  // Cardio
  'Running', 'Jogging', 'Walking', 'Cycling', 'Swimming', 'Elliptical', 'Rowing', 'Stair Climbing',
  
  // Strength Training  
  'Weight Lifting', 'Gym Workout', 'Bodyweight Training', 'Crossfit', 'Functional Training',
  
  // Mind-Body
  'Yoga', 'Pilates', 'Tai Chi', 'Meditation', 'Stretching',
  
  // Sports & Activities
  'Basketball', 'Tennis', 'Soccer', 'Volleyball', 'Baseball', 'Golf', 'Rock Climbing', 'Skiing', 'Snowboarding', 
  'Surfing', 'Skateboarding', 'Boxing', 'Martial Arts', 'Badminton', 'Table Tennis',
  
  // Dance & Fun
  'Dance', 'Zumba', 'Aerobics', 'Spin Class', 'HIIT',
  
  // Outdoor
  'Hiking', 'Trail Running', 'Mountain Biking', 'Kayaking', 'Paddleboarding', 'Camping Activities',
  
  'Other'
];

export interface SportRoutine {
  activity: string;
  duration: number; // minutes
  days: string[]; // ['Monday', 'Wednesday', 'Friday']
  time: string; // '06:30' or '18:00'
  isRecurring: boolean;
}

export const weekDays = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
]; 