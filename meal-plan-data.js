const TARGETS = { kcal: 1900, protein: 150, carbs: 190, fat: 55 };

const DAYS = [
  {
    id: "monday",
    title: "Monday — Travel Day",
    subtitle: "Leave hometown 6 AM → Office by 10 AM. Portable, no-cook meals.",
    meals: [
      { name: "🌅 Pre-Travel Quick Bite", time: "5:30 AM", kcal:290, p:28, c:22, f:10,
        items: ["3 boiled egg whites + 1 whole egg (prep night before)","1 medium banana","5 almonds"] },
      { name: "🚌 Travel Snack", time: "7:30 AM", kcal:220, p:16, c:18, f:10,
        items: ["Low-fat paneer cubes (80g) with chaat masala","Roasted chana (30g)","Small apple or guava"] },
      { name: "🍛 Office Lunch", time: "1:00 PM", kcal:550, p:42, c:52, f:14,
        items: ["Grilled chicken breast (150g) — packed from home or canteen","1 cup steamed rice","Mixed veg sabzi (beans/gourd)","Small salad with lemon"] },
      { name: "☕ Afternoon Snack", time: "4:30 PM", kcal:170, p:16, c:15, f:6,
        items: ["Curd/yogurt (200g, low-fat)","1 tbsp flaxseed or chia","Green tea (optional)"] },
      { name: "🌙 Dinner", time: "8:30 PM", kcal:560, p:35, c:50, f:22,
        items: ["Chicken curry (120g chicken, light oil)","2 whole wheat roti","Cucumber-onion raita (100g)","Side salad"] },
      { name: "😴 Before Bed (optional)", time: "10:00 PM", kcal:90, p:8, c:10, f:2,
        items: ["1 glass warm turmeric milk (toned, 200ml)"] }
    ],
    totals: { kcal:1870, p:149, c:169, f:60 }
  },
  {
    id: "tue-thu",
    title: "Tue–Thu — Office + Gym",
    subtitle: "Leave 8 AM → Office → Gym till 7 PM → Home by 8:30–9 PM",
    meals: [
      { name: "🌅 Breakfast", time: "7:30 AM", kcal:400, p:30, c:38, f:12,
        items: ["Oats (50g) cooked in toned milk (200ml)","2 boiled egg whites on the side","Low-fat paneer cubes (50g) in oats","5 almonds"] },
      { name: "🥜 Mid-Morning", time: "10:30 AM", kcal:160, p:14, c:12, f:6,
        items: ["Curd (150g, low-fat) with roasted flax","1 small fruit (apple/guava)"] },
      { name: "🍗 Lunch", time: "1:00 PM", kcal:530, p:40, c:50, f:14,
        items: ["Chicken breast (150g) grilled/light curry","1 cup brown/white rice","Dal (1 small bowl, moong/masoor)","Salad + sabzi"] },
      { name: "⚡ Pre-Workout", time: "5:30 PM", kcal:250, p:24, c:22, f:8,
        items: ["Low-fat paneer cubes (80g) with black pepper","1 banana","Black coffee (optional, 30 min before gym)"] },
      { name: "🏋️ Post-Workout Dinner", time: "8:30 PM", kcal:520, p:38, c:42, f:18,
        items: ["Egg bhurji (4 whites + 2 whole) or chicken (120g)","2 whole wheat roti","Palak/mixed veg sabzi","Onion-tomato salad"] },
      { name: "😴 Before Bed", time: "10:30 PM", kcal:90, p:8, c:10, f:2,
        items: ["Warm milk (200ml toned) or small bowl curd"] }
    ],
    totals: { kcal:1900, p:154, c:176, f:53 }
  },
  {
    id: "friday",
    title: "Friday — Travel Back",
    subtitle: "Office till 6 PM → Leave → Reach home by 10 PM",
    meals: [
      { name: "🌅 Breakfast", time: "8:00 AM", kcal:370, p:26, c:38, f:10,
        items: ["3 boiled egg whites + 1 whole egg","2 whole wheat toast","1 glass toned milk (200ml)"] },
      { name: "🧀 Mid-Morning", time: "10:30 AM", kcal:160, p:14, c:10, f:8,
        items: ["Low-fat paneer cubes (60g) with pepper","5 almonds or mixed nuts"] },
      { name: "🍛 Lunch", time: "1:00 PM", kcal:530, p:40, c:52, f:14,
        items: ["Chicken + rice meal (office canteen or packed)","Dal + sabzi side","Curd (100g)"] },
      { name: "🎒 Pre-Travel Snack", time: "5:30 PM", kcal:230, p:24, c:18, f:8,
        items: ["Low-fat paneer cubes (80g) with chaat masala","1 banana or apple","Roasted chana (20g)"] },
      { name: "🚌 Travel Meal", time: "7:30 PM", kcal:450, p:32, c:40, f:16,
        items: ["Packed: 2 roti + chicken/paneer dry sabzi","Roasted chana (30g)","Small fruit"] },
      { name: "🏠 Home Arrival (light)", time: "10:15 PM", kcal:100, p:10, c:8, f:3,
        items: ["Warm milk (200ml)","or small curd bowl (150g)"] }
    ],
    totals: { kcal:1810, p:148, c:166, f:54 }
  },
  {
    id: "weekend",
    title: "Weekend — Flexible",
    subtitle: "More time for cooking. Conditioning/cardio days. Slightly higher carbs for recovery.",
    meals: [
      { name: "🌅 Brunch", time: "9:30 AM", kcal:450, p:32, c:42, f:14,
        items: ["Egg bhurji (3 whites + 2 whole) with onion-tomato","2 whole wheat roti or 1 stuffed paratha","Curd (100g)","Green chutney"] },
      { name: "🍌 Mid-Day Snack", time: "12:00 PM", kcal:180, p:14, c:20, f:5,
        items: ["Fruit bowl (banana + apple)","Handful of roasted makhana or chana"] },
      { name: "🍛 Lunch", time: "2:00 PM", kcal:580, p:42, c:58, f:16,
        items: ["Chicken curry / paneer bhurji (150g protein source)","1.5 cups rice or 2 roti","Dal tadka (1 bowl)","Salad + raita"] },
      { name: "⚡ Pre-Cardio / Snack", time: "5:00 PM", kcal:230, p:24, c:15, f:8,
        items: ["Grilled paneer cubes (80g) with pepper & chaat masala","1 banana","5 almonds"] },
      { name: "🌙 Dinner", time: "8:30 PM", kcal:480, p:34, c:40, f:18,
        items: ["Grilled chicken tikka (120g) or paneer tikka","2 roti","Baingan bharta / mixed veg","Onion-cucumber salad"] }
    ],
    totals: { kcal:1890, p:147, c:178, f:57 }
  }
];

const WORKOUT_NUTRITION = [
  { title: "⚡ Pre-Workout (60-90 min before)", items: [
    "Paneer cubes / boiled eggs + banana = protein + quick carbs",
    "Black coffee 30 min before for focus & performance boost",
    "Avoid heavy/fatty foods within 90 min of training",
    "Sip water (300-400ml) in the hour before gym"
  ]},
  { title: "💪 Post-Workout (within 60 min)", items: [
    "High-protein dinner: eggs/chicken + roti + sabzi",
    "Include carbs to replenish glycogen (rice/roti)",
    "This is the most important meal — don't skip it",
    "Add curd/raita for probiotics and extra protein"
  ]},
  { title: "💧 Hydration & Electrolytes", items: [
    "3.5-4L water daily (more on training days)",
    "Nimbu paani with salt during/after workout",
    "Coconut water on weekends post-cardio",
    "ORS sachets if sweating heavily in summer",
    "Avoid excessive tea/coffee after 4 PM (sleep quality)"
  ]},
  { title: "😴 Recovery Support", items: [
    "Warm turmeric milk before bed (anti-inflammatory)",
    "Aim for 7-8 hours sleep — non-negotiable",
    "Space protein ~30-40g per meal across the day",
    "Weekend slightly higher carbs aid weekly recovery",
    "Magnesium-rich foods (banana, nuts) support sleep"
  ]}
];

const GROCERY = [
  { cat: "🥩 Protein", items: [
    { name: "Chicken breast/thigh", qty: "2 kg/week", cost: "₹500-600" },
    { name: "Eggs", qty: "36/week (3 trays)", cost: "₹240-300" },
    { name: "Low-fat paneer", qty: "800g/week", cost: "₹300-360" },
    { name: "Curd/yogurt", qty: "2 kg/week", cost: "₹100-120" },
    { name: "Toned milk", qty: "3-4 L/week", cost: "₹100-150" }
  ]},
  { cat: "🌾 Carbs", items: [
    { name: "Whole wheat atta", qty: "1 kg/week", cost: "₹40-50" },
    { name: "Rice (brown/white)", qty: "1 kg/week", cost: "₹60-80" },
    { name: "Oats", qty: "500g/2 weeks", cost: "₹80-100" },
    { name: "Bread (whole wheat)", qty: "1 loaf/week", cost: "₹40-50" }
  ]},
  { cat: "🥦 Vegetables & Fruits", items: [
    { name: "Spinach/palak", qty: "500g/week", cost: "₹30-40" },
    { name: "Mixed veggies (beans, gourd, brinjal)", qty: "1 kg/week", cost: "₹80-100" },
    { name: "Onion, tomato, cucumber", qty: "1 kg each/week", cost: "₹60-80" },
    { name: "Bananas", qty: "6-8/week", cost: "₹30-40" },
    { name: "Apples/guava/seasonal", qty: "4-5/week", cost: "₹80-100" }
  ]},
  { cat: "🥜 Nuts & Others", items: [
    { name: "Almonds", qty: "100g/2 weeks", cost: "₹80-100" },
    { name: "Roasted chana", qty: "500g/week", cost: "₹50-70" },
    { name: "Flaxseed/chia", qty: "100g/month", cost: "₹60-80" },
    { name: "Peanut butter", qty: "200g/month", cost: "₹100-150" },
    { name: "Spices, oil, salt", qty: "As needed", cost: "₹100-150" }
  ]}
];

const MEAL_PREP = [
  { title: "🗓️ Sunday Prep (1.5-2 hours)", items: [
    "Boil 15-18 eggs → store in fridge (lasts all week)",
    "Grill/cook 1kg chicken breast → portion into 5 boxes",
    "Cut paneer (400g) into cubes → 5 daily portion boxes (80g each)",
    "Roast chana & makhana → ziplock bags for travel snacks",
    "Make roti dough → store in fridge (or make rotis for Mon-Tue)",
    "Wash & chop vegetables for the week",
    "Pre-mix oats portions (50g each) in containers",
    "Prepare Monday travel meal boxes"
  ]},
  { title: "🔄 Wednesday Mini-Prep (30 min)", items: [
    "Boil another batch of eggs if running low",
    "Cook chicken for Thu-Fri",
    "Prepare Friday travel meal & snack packs",
    "Restock fruit and curd"
  ]},
  { title: "📦 Daily Office Box", items: [
    "Lunch: chicken + rice + sabzi in 3-compartment box",
    "Snack box: boiled eggs + roasted chana + fruit",
    "Carry: paneer cubes box + boiled eggs + banana",
    "Keep almonds & roasted chana at office desk"
  ]}
];

const SUPPLEMENTS = [
  { name: "Whey Protein (start after Month 1)", dose: "1-2 scoops/day", why: "Will make hitting 150g easier — start after first month", priority: "Later" },
  { name: "Creatine Monohydrate", dose: "5g daily with water", why: "Strength, recovery, muscle fullness", priority: "Highly Recommended" },
  { name: "Vitamin D3", dose: "2000-4000 IU/day", why: "Most Indians are deficient; supports recovery", priority: "Recommended" },
  { name: "Fish Oil / Omega-3", dose: "1000mg/day", why: "Joint health, inflammation, heart health", priority: "Recommended" },
  { name: "Magnesium", dose: "200-400mg before bed", why: "Sleep quality, muscle cramps, recovery", priority: "Optional" },
  { name: "Multivitamin", dose: "1/day with breakfast", why: "Cover micronutrient gaps during calorie deficit", priority: "Optional" }
];

const SUBSTITUTIONS = [
  { original: "Chicken breast", alts: "Chicken thigh (slightly more fat), fish (rohu/pomfret), soya chunks (budget option)" },
  { original: "Brown rice", alts: "White rice (similar cals), quinoa, daliya (broken wheat)" },
  { original: "Whole wheat roti", alts: "Jowar/bajra roti, rice roti, oats roti" },
  { original: "Whey protein", alts: "Soya protein, extra eggs/chicken (whole food), paneer shake" },
  { original: "Oats", alts: "Daliya, poha (add eggs for protein), upma with eggs" },
  { original: "Curd", alts: "Buttermilk (chaas), paneer, cottage cheese" },
  { original: "Almonds", alts: "Peanuts (cheaper), walnuts, makhana (fox nuts)" },
  { original: "Apple/guava", alts: "Any seasonal fruit — papaya, orange, muskmelon" }
];

const AVOID_FOODS = [
  "Fried snacks — samosa, pakora, bhujia (high cal, low protein)",
  "Sugary drinks — cola, packaged juice, energy drinks",
  "Excessive oil/ghee — limit to 2-3 tsp/day total",
  "Biscuits & bakery items — empty calories",
  "Alcohol — directly impairs muscle recovery & fat loss",
  "White bread & maida products — low satiety",
  "Sweets & mithai — save for occasional treat only",
  "Instant noodles — low protein, high sodium"
];

const CHEAT_MEAL = [
  "Schedule 1 flexible meal per week (Saturday lunch ideal)",
  "Keep it to ONE meal, not an entire cheat day",
  "Good options: biryani, butter chicken + naan, rajma-chawal extra portion",
  "Aim for ~600-700 kcal for the cheat meal",
  "Eat less at other meals that day to balance (~1400-1500 kcal outside cheat)",
  "Don't feel guilty — planned flexibility improves long-term adherence",
  "Avoid making it an all-you-can-eat binge"
];

const TRAINING_DAYS = [
  { id:1, label:"DAY 1", title:"Upper Body Strength", tag:"STRENGTH", color:"#FF6B35", icon:"💪",
    exercises: [
      { name:"Bench Press", sets:3, reps:"8", load:"No weight / 5kg each side" },
      { name:"Dumbbell Shoulder Press", sets:3, reps:"8–10", load:"5 / 7.5 kg" },
      { name:"Med Ball Chest Throws", sets:3, reps:"6–8", load:"Med ball" },
      { name:"Planks", sets:2, reps:"2", load:"—", note:"1 – 1.5 min each" },
      { name:"Side Planks", sets:2, reps:"2", load:"—", note:"1 min each side" },
      { name:"Push-Ups", sets:3, reps:"10", load:"Bodyweight" },
      { name:"Pull-Up Negatives", sets:3, reps:"5", load:"Bodyweight", note:"Jump up, lower slowly 5 sec. Month 2→3×3 full pull-ups · Month 3→3×5" }
    ]},
  { id:2, label:"DAY 2", title:"Lower Body Strength", tag:"STRENGTH", color:"#FF6B35", icon:"🦵",
    exercises: [
      { name:"Deadlift", sets:3, reps:"8–10", load:"Barbell + 10kg plates" },
      { name:"Barbell Back Squat", sets:3, reps:"8", load:"Barbell + 10kg plates" },
      { name:"Romanian Deadlift", sets:3, reps:"8", load:"Barbell + 10kg plates" },
      { name:"Sumo Squats", sets:3, reps:"8", load:"10 / 15kg dumbbell" },
      { name:"Dumbbell Lunges", sets:3, reps:"8", load:"7.5 / 10kg dumbbell" },
      { name:"Barbell / Dumbbell Step-Up", sets:3, reps:"8", load:"7.5 / 10kg dumbbell" }
    ]},
  { id:3, label:"DAY 3", title:"Conditioning", tag:"CARDIO", color:"#00C2FF", icon:"🏃",
    exercises: [
      { name:"Steady State (Choose one)", sets:2, reps:"3", load:"—", note:"Run @ 9 km/h OR Row @ 9 km/h OR Cycle @ 18 km/h — 6 min per rep" },
      { name:"Sprint Intervals", sets:2, reps:"3", load:"—", note:"First 60m @ 14.4 km/h → next 40m @ 9.6 km/h" }
    ]},
  { id:4, label:"DAY 4", title:"Full Body", tag:"FULL BODY", color:"#A259FF", icon:"⚡",
    exercises: [
      { name:"Chest Press / Chest Fly", sets:2, reps:"6–8", load:"7.5kg DB / Empty bar or 5kg plates" },
      { name:"Shoulder Press / Military Press", sets:2, reps:"6–8", load:"7.5kg DB / Empty barbell" },
      { name:"Dumbbell Rows", sets:3, reps:"8", load:"7.5 kg" },
      { name:"Cable Rows", sets:3, reps:"8", load:"10 / 15 kg" },
      { name:"Front Squats", sets:3, reps:"8", load:"Barbell + 5 / 10kg plates" },
      { name:"Deadlift", sets:2, reps:"8", load:"Barbell + 12.5kg plates" },
      { name:"Step-Ups", sets:2, reps:"8", load:"Barbell + 5kg plates" },
      { name:"Lunges", sets:2, reps:"8", load:"5kg dumbbells" }
    ]},
  { id:5, label:"DAY 5", title:"Calisthenics — Push + Core", tag:"CALISTHENICS", color:"#2ECC71", icon:"🤸",
    exercises: [
      { name:"Push-Ups", sets:3, reps:"8", load:"Bodyweight", note:"Month 2→3×12 · Month 3→3×15 · Month 4→Diamond 3×8" },
      { name:"Pull-Up Negatives", sets:3, reps:"5", load:"Bodyweight", note:"Jump up, lower slowly 5 sec. Month 2→3×3 full pull-ups · Month 4→3×5" },
      { name:"Dips (Bench)", sets:3, reps:"8", load:"Bodyweight", note:"Hands on bench, feet on floor. Month 3→Parallel bar dips 3×5" },
      { name:"Plank Hold", sets:2, reps:"1 min", load:"Bodyweight", note:"Month 2→2×90sec · Month 3→2×2min · Month 4→Weighted plank" },
      { name:"Dead Hang", sets:3, reps:"20 sec", load:"Bar", note:"Grip strength. Month 2→30sec · Month 3→45sec · Month 4→Active hang" },
      { name:"Knee Raises (Hanging)", sets:3, reps:"8", load:"Bar", note:"Month 2→3×12 · Month 3→Straight leg raises 3×6 · Month 4→3×10" },
      { name:"Superman Hold", sets:2, reps:"30 sec", load:"Floor", note:"Lower back + posterior chain. Month 2→2×45sec" },
      { name:"Foam Rolling + Stretching", sets:1, reps:"10 min", load:"—", note:"Chest, shoulders, hip flexors, hamstrings" }
    ]},
  { id:6, label:"DAY 6", title:"Conditioning", tag:"CARDIO", color:"#00C2FF", icon:"🔥",
    exercises: [
      { name:"Sprint HIIT", sets:2, reps:"3", load:"14–16 km/h", note:"20 sec max sprint → 20 sec passive rest" },
      { name:"Zone 4 Run", sets:2, reps:"1", load:"~1100m in 5 min", note:"5 min run (1100m) → 3 min rest. Repeat once." }
    ]},
  { id:7, label:"DAY 7", title:"Full Rest Day", tag:"REST", color:"#4ECDC4", icon:"😴",
    exercises: [
      { name:"Complete Rest", sets:null, reps:null, load:"—", note:"Your body grows during rest, not in the gym. Sleep 8+ hours." },
      { name:"Light Walk (optional)", sets:null, reps:null, load:"—", note:"15-20 min easy walk if you feel like moving. No intensity." },
      { name:"Foam Roll / Stretch (optional)", sets:null, reps:null, load:"—", note:"10 min full body foam rolling if muscles are sore." },
      { name:"Meal Prep for the Week", sets:null, reps:null, load:"—", note:"Boil eggs, cook chicken, portion paneer, pack Monday travel meals." }
    ]}
];

const COACH_NOTES = {
  1: "Focus on form over load. Keep shoulders retracted on bench. Controlled negatives on pull-ups.",
  2: "Brace your core throughout. Hip hinge pattern on RDL is key — don't round lower back.",
  3: "Stay consistent on pacing. Conditioning is about building aerobic base — don't go all-out.",
  4: "Lower load than Day 1 & 2 — this is volume work. Focus on muscle activation over weight.",
  5: "Calisthenics day! Focus on perfect form and slow controlled reps. Each exercise has monthly progressions — level up when current reps feel easy for 2 sessions straight.",
  6: "Maximal intent on the 20-sec sprints. Full passive rest between reps. Zone 4 = conversational effort.",
  7: "Full rest day. Your muscles repair and grow during rest — this is not laziness, it's part of the program. Hydrate well, eat your protein, and prepare mentally for the next week."
};
