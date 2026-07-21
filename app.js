const root = document.documentElement;
const themeToggle = document.getElementById('theme-toggle');

function applyTheme(theme) {
  const isLight = theme === 'light';

  if (isLight) {
    root.setAttribute('data-theme', 'light');
  } else {
    root.removeAttribute('data-theme');
  }

  if (themeToggle) {
    themeToggle.setAttribute('aria-label', isLight ? 'Switch to dark mode' : 'Switch to light mode');
  }

  localStorage.setItem('theme', isLight ? 'light' : 'dark');
}

if (themeToggle) {
  const savedTheme = localStorage.getItem('theme');
  applyTheme(savedTheme === 'light' ? 'light' : 'dark');

  themeToggle.addEventListener('click', () => {
    const isLight = root.getAttribute('data-theme') === 'light';
    applyTheme(isLight ? 'dark' : 'light');
  });
}

const form = document.getElementById('profile-form');

if (form) {
  // Load existing profile data
  const savedProfile = localStorage.getItem('userProfile');
  if (savedProfile) {
    const profile = JSON.parse(savedProfile);
    Object.keys(profile).forEach((key) => {
      const field = form.querySelector(`[name="${key}"]`);
      if (field) {
        if (field.type === 'checkbox') {
          if (Array.isArray(profile[key])) {
            profile[key].forEach((value) => {
              const checkbox = form.querySelector(`[name="${key}"][value="${value}"]`);
              if (checkbox) checkbox.checked = true;
            });
          }
        } else {
          field.value = profile[key];
        }
      }
    });
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    // Validate required fields
    const name = form.querySelector('[name="name"]').value.trim();
    const email = form.querySelector('[name="email"]').value.trim();
    const weight = form.querySelector('[name="weight"]').value;
    const age = form.querySelector('[name="age"]').value;
    const gender = form.querySelector('[name="gender"]').value;

    if (!name || !email || !weight || !age || !gender) {
      alert('Please fill in all required fields.');
      return;
    }

    const formData = new FormData(form);
    const profile = Object.fromEntries(formData.entries());

    // Save to localStorage
    localStorage.setItem('userProfile', JSON.stringify(profile));

    // Show success message
    const existingSummary = form.querySelector('.form-summary');
    if (existingSummary) existingSummary.remove();

    const summary = document.createElement('p');
    summary.className = 'form-summary form-success';
    summary.textContent = `✓ Profile saved! Welcome, ${name}. You're all set to start tracking your fitness journey.`;

    form.appendChild(summary);

    // Redirect to goals page after 2 seconds
    setTimeout(() => {
      window.location.href = '../goals/';
    }, 2000);
  });
}

// Make error sound globally accessible
window.playErrorSound = function() {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const gainNode = audioContext.createGain();

  gainNode.connect(audioContext.destination);
  gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

  // First note - A5
  const osc1 = audioContext.createOscillator();
  osc1.connect(gainNode);
  osc1.frequency.value = 880; // A5
  osc1.type = 'sine';
  osc1.start(audioContext.currentTime);
  osc1.stop(audioContext.currentTime + 0.15);

  // Second note - E6 (major third up, skips D)
  const osc2 = audioContext.createOscillator();
  osc2.connect(gainNode);
  osc2.frequency.value = 1318.51; // E6
  osc2.type = 'sine';
  osc2.start(audioContext.currentTime + 0.2);
  osc2.stop(audioContext.currentTime + 0.5);
};

// Make success sound globally accessible (for goals - original error sound)
window.playSuccessSound = function() {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const gainNode = audioContext.createGain();

  gainNode.connect(audioContext.destination);
  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

  // First note (higher) - G4
  const osc1 = audioContext.createOscillator();
  osc1.connect(gainNode);
  osc1.frequency.value = 392; // G4
  osc1.type = 'sine';
  osc1.start(audioContext.currentTime);
  osc1.stop(audioContext.currentTime + 0.15);

  // Second note (lower) - E4 (minor third down)
  const osc2 = audioContext.createOscillator();
  osc2.connect(gainNode);
  osc2.frequency.value = 330; // E4
  osc2.type = 'sine';
  osc2.start(audioContext.currentTime + 0.15);
  osc2.stop(audioContext.currentTime + 0.5);
};

// Handle Goals page
const goalsForm = document.getElementById('goals-form');
if (goalsForm) {
  const goalInputs = goalsForm.querySelectorAll('[name="goals"]');
  const goalCounter = document.getElementById('goal-counter');

  // Load existing goals
  const savedProfile = localStorage.getItem('userProfile');
  if (savedProfile) {
    const profile = JSON.parse(savedProfile);
    if (Array.isArray(profile.goals)) {
      profile.goals.forEach((goal) => {
        const goalInput = goalsForm.querySelector(`[value="${goal}"]`);
        if (goalInput) goalInput.checked = true;
      });
    }
  }

  // Limit to 2 selections
  goalInputs.forEach((input) => {
    input.addEventListener('change', () => {
      const checked = goalsForm.querySelectorAll('[name="goals"]:checked');
      
      if (checked.length > 2) {
        input.checked = false;
        window.playSuccessSound();
        alert('You can select up to 2 goals.');
        return;
      }

      if (checked.length === 0) {
        goalCounter.textContent = 'Select 1-2 goals';
        goalCounter.style.color = 'var(--muted)';
      } else if (checked.length === 1) {
        goalCounter.textContent = `1 goal selected: ${checked[0].value.replace(/-/g, ' ')}`;
        goalCounter.style.color = 'var(--accent)';
      } else {
        const goals = Array.from(checked).map(c => c.value.replace(/-/g, ' ')).join(' + ');
        goalCounter.textContent = `2 goals selected: ${goals}`;
        goalCounter.style.color = 'var(--accent)';
      }
    });
  });

  goalsForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const checked = goalsForm.querySelectorAll('[name="goals"]:checked');
    
    if (checked.length === 0) {
      alert('Please select at least 1 goal.');
      return;
    }

    const profile = JSON.parse(localStorage.getItem('userProfile') || '{}');
    profile.goals = Array.from(checked).map(c => c.value);
    localStorage.setItem('userProfile', JSON.stringify(profile));
    window.location.href = '../frequency/';
  });
}

// Handle Frequency page
const frequencyForm = document.getElementById('frequency-form');
if (frequencyForm) {
  const savedProfile = localStorage.getItem('userProfile');
  if (savedProfile) {
    const profile = JSON.parse(savedProfile);
    const frequencyField = frequencyForm.querySelector(`[value="${profile.frequency}"]`);
    if (frequencyField) frequencyField.checked = true;
  }

  frequencyForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const profile = JSON.parse(localStorage.getItem('userProfile') || '{}');
    profile.frequency = frequencyForm.querySelector('[name="frequency"]:checked').value;
    localStorage.setItem('userProfile', JSON.stringify(profile));
    window.location.href = '../equipment/';
  });
}

// Handle Equipment page
const equipmentForm = document.getElementById('equipment-form');
if (equipmentForm) {
  const categoryToggles = equipmentForm.querySelectorAll('.category-toggle');

  // Toggle dropdown visibility with arrow rotation
  categoryToggles.forEach((button) => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      const dropdown = button.closest('.equipment-category').querySelector('.equipment-dropdown');
      if (dropdown) {
        dropdown.style.display = dropdown.style.display === 'none' ? 'grid' : 'none';
        button.classList.toggle('open');
      }
    });
  });

  // Load existing equipment
  const savedProfile = localStorage.getItem('userProfile');
  if (savedProfile) {
    const profile = JSON.parse(savedProfile);
    if (Array.isArray(profile.equipment)) {
      profile.equipment.forEach((item) => {
        const checkbox = equipmentForm.querySelector(`input[name="equipment"][value="${item}"]`);
        if (checkbox) {
          checkbox.checked = true;
          // Open the category dropdown
          const categoryButton = checkbox.closest('.equipment-dropdown').previousElementSibling;
          if (categoryButton && categoryButton.classList.contains('category-toggle')) {
            categoryButton.classList.add('open');
            checkbox.closest('.equipment-dropdown').style.display = 'grid';
          }
        }
      });
    }
  }

  equipmentForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const allCheckboxes = equipmentForm.querySelectorAll('input[name="equipment"]:checked');
    const equipment = Array.from(allCheckboxes).map((checkbox) => checkbox.value);

    const profile = JSON.parse(localStorage.getItem('userProfile') || '{}');
    profile.equipment = equipment;
    localStorage.setItem('userProfile', JSON.stringify(profile));
    window.location.href = '../schedule/';
  });
}

// Handle Schedule page - Display personalized plan
const scheduleSection = document.getElementById('schedule-section');
if (scheduleSection) {
  const profile = JSON.parse(localStorage.getItem('userProfile') || '{}');
  const planContent = document.getElementById('plan-content');

  if (!profile.name) {
    planContent.innerHTML = '<p>No profile found. <a href="../setup/">Create one</a></p>';
  } else {
    const bmi = calculateBMI(profile.weight, profile['height-ft'], profile['height-in']);
    const plan = generatePlan(profile, bmi);
    planContent.innerHTML = plan;


  }

  // Navigation buttons
  const startLogging = document.getElementById('start-logging');
  const editProfile = document.getElementById('edit-profile');

  if (startLogging) {
    startLogging.addEventListener('click', () => {
      window.location.href = '../daily-logs/';
    });
  }

  if (editProfile) {
    editProfile.addEventListener('click', () => {
      window.location.href = '../setup/';
    });
  }
}

function calculateBMI(weight, feet, inches) {
  const totalInches = (feet * 12) + parseInt(inches);
  const bmi = (weight / (totalInches * totalInches)) * 703;
  return bmi.toFixed(1);
}

function generatePlan(profile, bmi) {
  const goals = Array.isArray(profile.goals) ? profile.goals : [profile.goals || 'general-fitness'];
  const frequency = profile.frequency || 'few-times-a-week';
  const frequencyLabel = frequency.replace(/-/g, ' ').charAt(0).toUpperCase() + frequency.replace(/-/g, ' ').slice(1);
  const sessionCount = getSessionCount(frequency);
  const calorieNeeds = estimateCalories(profile.weight, profile.age, profile.gender);
  
  // Get personalized recommendations based on exact profile data
  const workoutRecs = getWorkoutRecommendations(goals, frequency, profile.equipment, profile.weight);
  const nutritionRecs = getNutritionRecommendations(goals, calorieNeeds, profile.weight);

  return `
    <div class="plan-summary">
      <p>Here's your customized fitness and nutrition plan based on your profile:</p>
    </div>

    <div class="plan-card">
      <h2>Workout Guide</h2>
      <div class="info-section">
        <h3>Your Profile Data</h3>
        <ul>
          <li><strong>Weight:</strong> ${profile.weight} lbs</li>
          <li><strong>Frequency:</strong> ${frequencyLabel} (${sessionCount} sessions/week)</li>
          <li><strong>Goals:</strong> ${goals.join(', ')}</li>
          <li><strong>Equipment Available:</strong> ${profile.equipment && profile.equipment.length > 0 ? profile.equipment.join(', ') : 'Bodyweight only'}</li>
        </ul>
      </div>
      
      <div class="recommendations-section">
        <h3>Your Workout Recommendations</h3>
        ${workoutRecs}
      </div>
      
      <p style="margin-top: 1.5rem; font-size: 0.95rem; color: var(--muted);">Log your workouts with exact sets, reps, and weights in the Daily Logs to track progress over time.</p>
    </div>

    <div class="plan-card">
      <h2>Nutrition Guide</h2>
      <div class="info-section">
        <h3>Your Caloric Needs</h3>
        <p><strong>Daily target:</strong> ${calorieNeeds} calories</p>
        <p style="font-size: 0.95rem; color: var(--muted);">Based on: weight (${profile.weight} lbs), age (${profile.age}), gender (${profile.gender}), activity level</p>
        <p style="margin-top: 0.75rem; font-size: 0.9rem;">Adjust by ±200 calories after 2-3 weeks if not seeing desired results.</p>
      </div>

      <div class="recommendations-section">
        <h3>Your Macro Targets</h3>
        ${nutritionRecs}
      </div>

      <p style="margin-top: 1.5rem; font-size: 0.95rem;">Log meals with approximate amounts in the Daily Logs. Focus on consistency over perfection.</p>
    </div>
  `;
}

function getWorkoutRecommendations(goals, frequency, equipment, weight) {
  if (!Array.isArray(goals)) goals = [goals];

  let recs = '';

  if (goals.includes('muscle-gain')) {
    recs += `
      <div class="recommendation-item">
        <h4>Muscle Building Training</h4>
        <p><strong>Rep Range:</strong> 6-12 reps per set (focus on 8-10)</p>
        <p><strong>Sets per exercise:</strong> 3-4 sets</p>
        <p><strong>Rest between sets:</strong> 60-90 seconds</p>
        <p><strong>Example workout:</strong> Bench Press 4x8 @ 185 lbs → Incline Dumbbell 3x10 @ 65 lbs → Barbell Rows 4x8 @ 185 lbs</p>
        <p style="font-size: 0.9rem; color: var(--muted);"><strong>Tip:</strong> Progressive overload - add 2-5 lbs or 1-2 reps each week. Prioritize compound movements (bench, squat, deadlift, rows).</p>
      </div>
    `;
  }

  if (goals.includes('fat-loss')) {
    recs += `
      <div class="recommendation-item">
        <h4>Fat Loss Training</h4>
        <p><strong>Rep Range:</strong> 8-15 reps per set</p>
        <p><strong>Sets per exercise:</strong> 3-4 sets with short rest</p>
        <p><strong>Rest between sets:</strong> 30-45 seconds (circuit style)</p>
        <p><strong>Example workout:</strong> Dumbbell Thrusters 3x12 → Kettlebell Swings 3x15 → Battle Ropes 3x30 sec → Rowing Machine 3x500m</p>
        <p style="font-size: 0.9rem; color: var(--muted);"><strong>Tip:</strong> Keep moving. Combine strength + cardio in same session. Track total volume (sets × reps) weekly.</p>
      </div>
    `;
  }

  if (goals.includes('strength')) {
    recs += `
      <div class="recommendation-item">
        <h4>Strength Building Training</h4>
        <p><strong>Rep Range:</strong> 3-6 reps per set (heavy weight)</p>
        <p><strong>Sets per exercise:</strong> 4-6 sets</p>
        <p><strong>Rest between sets:</strong> 2-3 minutes (full recovery)</p>
        <p><strong>Example workout:</strong> Deadlift 5x3 @ 315 lbs → Pause Squats 5x3 @ 275 lbs → Barbell Rows 4x4 @ 225 lbs</p>
        <p style="font-size: 0.9rem; color: var(--muted);"><strong>Tip:</strong> Focus on the "big 4": Deadlift, Squat, Bench Press, Barbell Row. Track your 1RM estimates. Form is critical.</p>
      </div>
    `;
  }

  if (goals.includes('endurance')) {
    recs += `
      <div class="recommendation-item">
        <h4>Endurance Training</h4>
        <p><strong>Cardio Duration:</strong> 30-60 minutes per session</p>
        <p><strong>Intensity:</strong> Steady pace for 3-4 sessions, one high-intensity interval session (30sec hard / 90sec easy for 20 min)</p>
        <p><strong>Weekly breakdown:</strong> 3x steady state + 1x HIIT</p>
        <p><strong>Example workouts:</strong> 5K run in 25 minutes → 45 min stationary bike at moderate pace → HIIT on treadmill</p>
        <p style="font-size: 0.9rem; color: var(--muted);"><strong>Tip:</strong> Mix modalities (running, cycling, rowing). For incline vs speed: Use 3-5% incline at steady pace rather than flat at high speed to reduce joint impact.</p>
      </div>
    `;
  }

  if (goals.includes('age-well')) {
    recs += `
      <div class="recommendation-item">
        <h4>Longevity & Functional Training</h4>
        <p><strong>Movement Focus:</strong> Compound, multi-planar movements</p>
        <p><strong>Rep Range:</strong> 8-12 reps with controlled tempo (2 sec down, 1 sec up)</p>
        <p><strong>Session structure:</strong> 5-10 min warm-up mobility → strength work → 10 min cool-down stretching</p>
        <p><strong>Example workout:</strong> Goblet Squats 3x10 → Single-Leg Deadlifts 3x8 each → Push-ups 3x10 → Farmer Carries 3x40 yards</p>
        <p style="font-size: 0.9rem; color: var(--muted);"><strong>Tip:</strong> Prioritize joint health and balance. Include rotation work. Stop 1-2 reps before failure to reduce injury risk.</p>
      </div>
    `;
  }

  if (goals.includes('general-fitness')) {
    recs += `
      <div class="recommendation-item">
        <h4>Balanced Fitness Training</h4>
        <p><strong>Weekly split:</strong> 2x strength (6-10 reps) + 2x cardio (30-45 min) + 1x flexibility</p>
        <p><strong>Sets per exercise:</strong> 3 sets</p>
        <p><strong>Rest between sets:</strong> 60 seconds</p>
        <p><strong>Example workout:</strong> Squats 3x8 → Chest Press 3x8 → Rows 3x8 → 20 min cardio (run or bike)</p>
        <p style="font-size: 0.9rem; color: var(--muted);"><strong>Tip:</strong> Rotate between upper body, lower body, and full-body days. Keep workouts under 60 minutes.</p>
      </div>
    `;
  }

  return recs;
}

function getNutritionRecommendations(goals, calories, weight) {
  if (!Array.isArray(goals)) goals = [goals];

  const nutritionDatabase = {
    'muscle-gain': {
      macros: { protein: 1.0, carbs: 0.45, fat: 0.20 },
      examples: [
        {
          name: 'High Protein Standard',
          meals: [
            'Breakfast: 3 whole eggs + 2 slices whole wheat toast + 1 tbsp butter (40g protein, 40g carbs, 20g fat)',
            'Lunch: 8oz chicken breast + 1.5 cups white rice + 1 tbsp olive oil (60g protein, 70g carbs, 15g fat)',
            'Snack: Protein shake (25g isolate) + banana + 2 tbsp peanut butter (35g protein, 45g carbs, 20g fat)',
            'Dinner: 8oz salmon + 8oz sweet potato + veggies + oil (50g protein, 60g carbs, 18g fat)'
          ]
        },
        {
          name: 'Budget Friendly',
          meals: [
            'Breakfast: 4 eggs + oatmeal (1/2 cup) + honey (35g protein, 35g carbs, 18g fat)',
            'Lunch: 1 lb ground turkey + 2 cups rice + veggies (55g protein, 80g carbs, 12g fat)',
            'Snack: Greek yogurt (0.75 cup) + granola (40g protein, 40g carbs, 8g fat)',
            'Dinner: 8oz chicken thighs + pasta + sauce (50g protein, 65g carbs, 20g fat)'
          ]
        }
      ]
    },
    'fat-loss': {
      macros: { protein: 1.1, carbs: 0.35, fat: 0.25 },
      examples: [
        {
          name: 'High Volume Low Calorie',
          meals: [
            'Breakfast: Egg whites (8) + oatmeal (0.5 cup) + berries (40g protein, 30g carbs, 5g fat)',
            'Lunch: 6oz lean turkey breast + brown rice (1 cup) + broccoli (55g protein, 45g carbs, 8g fat)',
            'Snack: Protein shake (isolate) + apple (25g protein, 30g carbs, 2g fat)',
            'Dinner: 6oz white fish + sweet potato + veggies (48g protein, 40g carbs, 10g fat)'
          ]
        },
        {
          name: 'Mediterranean',
          meals: [
            'Breakfast: Greek yogurt (0.75 cup) + granola + berries (25g protein, 35g carbs, 8g fat)',
            'Lunch: Grilled chicken + quinoa (1 cup) + olive oil + veggies (50g protein, 40g carbs, 12g fat)',
            'Snack: Almonds (1 oz) + orange (8g protein, 15g carbs, 14g fat)',
            'Dinner: 6oz salmon + lentil salad + olive oil (45g protein, 35g carbs, 15g fat)'
          ]
        }
      ]
    },
    'strength': {
      macros: { protein: 0.9, carbs: 0.50, fat: 0.20 },
      examples: [
        {
          name: 'Power Building',
          meals: [
            'Breakfast: 3 eggs + pancakes (1 cup flour) + maple syrup (35g protein, 50g carbs, 18g fat)',
            'Lunch: 8oz lean beef + 2 cups white rice + butter (65g protein, 80g carbs, 15g fat)',
            'Snack: Protein shake + oats + banana (30g protein, 60g carbs, 8g fat)',
            'Dinner: 8oz chicken + pasta (2 cups) + sauce (50g protein, 70g carbs, 10g fat)'
          ]
        }
      ]
    },
    'endurance': {
      macros: { protein: 0.7, carbs: 0.60, fat: 0.20 },
      examples: [
        {
          name: 'Endurance Fueling',
          meals: [
            'Breakfast: Oatmeal (1 cup) + banana + honey + egg white (25g protein, 80g carbs, 5g fat)',
            'Lunch: Pasta (2.5 cups) + lean chicken (6oz) + tomato sauce (45g protein, 100g carbs, 8g fat)',
            'Snack: Rice cakes + almond butter + banana (10g protein, 50g carbs, 12g fat)',
            'Dinner: 6oz fish + sweet potato (2 medium) + olive oil (42g protein, 90g carbs, 12g fat)'
          ]
        }
      ]
    },
    'general-fitness': {
      macros: { protein: 0.8, carbs: 0.50, fat: 0.25 },
      examples: [
        {
          name: 'Balanced Mixed',
          meals: [
            'Breakfast: 2 eggs + toast + avocado + berries (22g protein, 35g carbs, 15g fat)',
            'Lunch: 6oz chicken + brown rice (1.5 cups) + olive oil + veggies (48g protein, 55g carbs, 12g fat)',
            'Snack: Protein bar or Greek yogurt + nuts (20g protein, 25g carbs, 10g fat)',
            'Dinner: 6oz salmon + sweet potato + veggies (42g protein, 45g carbs, 14g fat)'
          ]
        }
      ]
    },
    'age-well': {
      macros: { protein: 1.0, carbs: 0.45, fat: 0.25 },
      examples: [
        {
          name: 'Anti-Inflammatory',
          meals: [
            'Breakfast: Greek yogurt + berries + walnuts + chia seeds (25g protein, 40g carbs, 12g fat)',
            'Lunch: 6oz grilled fish + quinoa + leafy greens + olive oil (45g protein, 50g carbs, 14g fat)',
            'Snack: Almonds + apple + almond butter (10g protein, 30g carbs, 14g fat)',
            'Dinner: 6oz lean beef or turkey + sweet potato + roasted veggies (48g protein, 45g carbs, 12g fat)'
          ]
        }
      ]
    }
  };

  const template = nutritionDatabase[goals[0]] || nutritionDatabase['general-fitness'];
  const macros = template.macros;
  
  const proteinG = Math.round(weight * macros.protein);
  const proteinCals = proteinG * 4;
  const carbsCals = Math.round(calories * macros.carbs);
  const carbsG = Math.round(carbsCals / 4);
  const fatCals = Math.round(calories * macros.fat);
  const fatG = Math.round(fatCals / 9);

  let recs = `
    <div class="recommendation-item">
      <h4>Macro Breakdown for ${calories} calories</h4>
      <ul>
        <li><strong>Protein:</strong> ${proteinG}g/day (${macros.protein}g per lb) = ${proteinCals} calories</li>
        <li><strong>Carbs:</strong> ${carbsG}g/day (${Math.round(macros.carbs * 100)}% of intake) = ${carbsCals} calories</li>
        <li><strong>Fats:</strong> ${fatG}g/day (${Math.round(macros.fat * 100)}% of intake) = ${fatCals} calories</li>
      </ul>
    </div>

    <div class="recommendation-item">
      <h4>Sample Day Plans</h4>
      ${template.examples.map(example => `
        <div class="nutrition-example-meals" style="margin-bottom: 1.5rem;">
          <strong>${example.name}</strong>
          <ul style="margin: 0.5rem 0 0 1.5rem; line-height: 1.6;">
            ${example.meals.map(meal => `<li>${meal}</li>`).join('')}
          </ul>
        </div>
      `).join('')}
    </div>
  `;

  // Store examples in window for later access
  window.currentNutritionExamples = template.examples;

  return recs;
}

function estimateCalories(weight, age, gender) {
  const bmr = gender === 'male' 
    ? 88.362 + (13.397 * weight / 2.205) + (4.799 * 68) - (5.677 * age)
    : 447.593 + (9.247 * weight / 2.205) + (3.098 * 68) - (4.330 * age);
  
  return Math.round(bmr * 1.4);
}

function interpretBMI(bmi) {
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Normal weight';
  if (bmi < 30) return 'Overweight';
  return 'Obese';
}

function getSessionCount(frequency) {
  const counts = {
    'once-a-week': '1',
    'few-times-a-week': '2-3',
    'four-times-a-week': '4',
    'weekdays': '5',
    'every-day': '6-7',
    'weekends': '2'
  };
  return counts[frequency] || '3';
}

function getMacroRecommendations(goals, calories) {
  if (!Array.isArray(goals)) goals = [goals];

  const macros = {
    'muscle-gain': {
      protein: '1.0-1.2g per lb',
      carbs: '40-50%',
      fat: '20-25%'
    },
    'fat-loss': {
      protein: '1.0-1.2g per lb',
      carbs: '30-40%',
      fat: '25-30%'
    },
    'strength': {
      protein: '0.8-1.0g per lb',
      carbs: '45-55%',
      fat: '20-25%'
    },
    'endurance': {
      protein: '0.6-0.8g per lb',
      carbs: '55-65%',
      fat: '20-25%'
    },
    'general-fitness': {
      protein: '0.7-1.0g per lb',
      carbs: '45-50%',
      fat: '25-30%'
    },
    'age-well': {
      protein: '1.0-1.2g per lb',
      carbs: '40-50%',
      fat: '20-30%'
    }
  };

  let recommendation;
  if (goals.length === 1) {
    recommendation = macros[goals[0]] || macros['general-fitness'];
  } else {
    // Average recommendations for dual goals
    recommendation = {
      protein: '1.0-1.2g per lb',
      carbs: '40-50%',
      fat: '20-30%'
    };
  }

  return `
    <ul>
      <li><strong>Protein:</strong> ${recommendation.protein}</li>
      <li><strong>Carbs:</strong> ${recommendation.carbs} of calories</li>
      <li><strong>Fats:</strong> ${recommendation.fat} of calories</li>
    </ul>
  `;
}

// Handle Daily Logs page
const workoutDayTabs = document.querySelectorAll('.day-tab:not(.food-tab)');
const foodDayTabs = document.querySelectorAll('.food-tab');
const workoutForm = document.getElementById('workout-form');
const foodForm = document.getElementById('food-form');

let selectedWorkoutDay = 'monday';
let selectedFoodDay = 'monday';

// Workout Log Handlers
if (workoutDayTabs.length > 0 && workoutForm) {
  workoutDayTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      workoutDayTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      selectedWorkoutDay = tab.dataset.day;

      // Update form title and load data
      document.getElementById('workout-day-title').textContent = 
        selectedWorkoutDay.charAt(0).toUpperCase() + selectedWorkoutDay.slice(1);
      
      const savedLogs = JSON.parse(localStorage.getItem('userLogs') || '{}');
      const dayLog = savedLogs.workouts?.[selectedWorkoutDay] || {};
      
      document.getElementById('workout-duration').value = dayLog.duration || '';
      document.getElementById('workout-activity').value = dayLog.activity || '';
      document.getElementById('workout-notes').value = dayLog.notes || '';
      
      workoutForm.style.display = 'block';
    });
  });

  // Set first day active
  workoutDayTabs[0]?.click();

  workoutForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const logs = JSON.parse(localStorage.getItem('userLogs') || '{}');
    
    if (!logs.workouts) logs.workouts = {};
    
    logs.workouts[selectedWorkoutDay] = {
      duration: document.getElementById('workout-duration').value,
      activity: document.getElementById('workout-activity').value,
      notes: document.getElementById('workout-notes').value
    };
    
    localStorage.setItem('userLogs', JSON.stringify(logs));
    window.playErrorSound();
    alert(`${selectedWorkoutDay.charAt(0).toUpperCase() + selectedWorkoutDay.slice(1)}'s workout saved!`);
  });
}

// Food Log Handlers
if (foodDayTabs.length > 0 && foodForm) {
  foodDayTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      foodDayTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      selectedFoodDay = tab.dataset.day;

      // Update form title and load data
      document.getElementById('food-day-title').textContent = 
        selectedFoodDay.charAt(0).toUpperCase() + selectedFoodDay.slice(1);
      
      const savedLogs = JSON.parse(localStorage.getItem('userLogs') || '{}');
      const dayLog = savedLogs.food?.[selectedFoodDay] || {};
      
      document.getElementById('food-breakfast').value = dayLog.breakfast || '';
      document.getElementById('food-lunch').value = dayLog.lunch || '';
      document.getElementById('food-snack').value = dayLog.snack || '';
      document.getElementById('food-dinner').value = dayLog.dinner || '';
      document.getElementById('food-notes').value = dayLog.notes || '';
      
      foodForm.style.display = 'block';
    });
  });

  // Set first day active
  foodDayTabs[0]?.click();

  foodForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const logs = JSON.parse(localStorage.getItem('userLogs') || '{}');
    
    if (!logs.food) logs.food = {};
    
    logs.food[selectedFoodDay] = {
      breakfast: document.getElementById('food-breakfast').value,
      lunch: document.getElementById('food-lunch').value,
      snack: document.getElementById('food-snack').value,
      dinner: document.getElementById('food-dinner').value,
      notes: document.getElementById('food-notes').value
    };
    
    localStorage.setItem('userLogs', JSON.stringify(logs));
    window.playErrorSound();
    alert(`${selectedFoodDay.charAt(0).toUpperCase() + selectedFoodDay.slice(1)}'s nutrition logged!`);
  });
}

// Handle Dashboard
const dashboard = document.getElementById('dashboard');
if (dashboard) {
  const profile = JSON.parse(localStorage.getItem('userProfile') || '{}');
  const logs = JSON.parse(localStorage.getItem('userLogs') || '{}');

  // Calculate stats
  const workouts = logs.workouts || {};
  const food = logs.food || {};
  
  const workoutCount = Object.keys(workouts).filter(day => workouts[day].activity).length;
  const nutritionCount = Object.keys(food).filter(day => food[day].breakfast).length;
  const totalDuration = Object.values(workouts).reduce((sum, log) => sum + (parseInt(log.duration) || 0), 0);
  
  const targetSessions = parseInt(getSessionCount(profile.frequency)?.split('-')[0] || 1);
  const consistencyScore = Math.min(100, Math.round((workoutCount / targetSessions) * 100));

  // Update stat cards
  document.getElementById('workout-count').textContent = workoutCount;
  document.getElementById('nutrition-count').textContent = nutritionCount;
  document.getElementById('total-duration').textContent = totalDuration;
  document.getElementById('consistency-score').textContent = consistencyScore + '%';

  // Generate workout summary
  const summaryHtml = Object.entries(workouts)
    .filter(([_, log]) => log.activity)
    .map(([day, log]) => `
      <div class="recommendation-item" style="margin-bottom: 1rem;">
        <strong>${day.charAt(0).toUpperCase() + day.slice(1)}</strong>
        <p style="margin: 0.5rem 0 0;">
          <strong>Duration:</strong> ${log.duration || 'N/A'} min | 
          <strong>Activity:</strong> ${log.activity.substring(0, 60)}${log.activity.length > 60 ? '...' : ''}
        </p>
        ${log.notes ? `<p style="margin: 0.5rem 0 0; color: var(--muted);"><strong>Notes:</strong> ${log.notes}</p>` : ''}
      </div>
    `)
    .join('');

  document.getElementById('workout-summary').innerHTML = summaryHtml || '<p style="color: var(--muted);">No workouts logged yet. Start tracking!</p>';

  // Tips database
  const tipsDatabase = {
    'consistency': [
      'Log your workouts right after you finish—don\'t wait until later.',
      'Set the same time each day for your training sessions.',
      'Track both wins and struggles; progress isn\'t always linear.',
      'Review your weekly logs every Sunday to spot patterns.'
    ],
    'muscle-gain': [
      'Progressive overload: increase weight or reps by 5% each week.',
      'Eat 1.5-2g protein per lb of bodyweight daily.',
      'Rest 48 hours between training the same muscle groups.',
      'Track your lifts to ensure you\'re hitting targets.'
    ],
    'fat-loss': [
      'Maintain a 300-500 calorie deficit (not more).',
      'Prioritize protein to preserve muscle during fat loss.',
      'Add 20-30 min of low-intensity cardio on rest days.',
      'Weigh yourself weekly, not daily—focus on weekly trends.'
    ],
    'strength': [
      'Focus on compound lifts: squat, deadlift, bench press.',
      'Rest 3-5 minutes between heavy sets.',
      'Practice the same lifts 2-3x per week for neural adaptation.',
      'Track your 1-rep max every 4 weeks to measure progress.'
    ],
    'endurance': [
      'Build aerobic base with 60-70% max heart rate zone work.',
      'Include one high-intensity interval session per week.',
      'Add easy recovery runs to build work capacity.',
      'Track total volume (distance/time) over intensity first.'
    ],
    'general-fitness': [
      'Mix strength and cardio work throughout your week.',
      'Vary your routine every 4 weeks to avoid plateaus.',
      'Listen to your body—take extra rest if needed.',
      'Focus on how you *feel*, not just the numbers.'
    ],
    'age-well': [
      'Prioritize joint health—avoid heavy loads, use full range of motion.',
      'Include mobility work 5-10 minutes daily.',
      'Balance training protects against falls—add unilateral work.',
      'Recovery matters more as we age; prioritize sleep and nutrition.'
    ]
  };

  // Get tips based on goals
  let tips = [];
  tips.push(...tipsDatabase['consistency'].slice(0, 2));
  if (profile.goals && Array.isArray(profile.goals)) {
    profile.goals.forEach(goal => {
      if (tipsDatabase[goal]) {
        tips.push(tipsDatabase[goal][Math.floor(Math.random() * tipsDatabase[goal].length)]);
      }
    });
  }
  tips = tips.slice(0, 4); // Limit to 4 tips

  const tipsHtml = tips.map(tip => `
    <div class="tip-item">
      <p>${tip}</p>
    </div>
  `).join('');

  document.getElementById('tips-container').innerHTML = tipsHtml || '<p style="color: var(--muted);">Tips will appear based on your goals.</p>';

  // Playlist recommendations
  const playlistDatabase = {
    'muscle-gain': [
      { name: 'Heavy Metal Gains', url: 'https://open.spotify.com/playlist/7qiZfU4dY1lsylvNEJMcs7' },
      { name: 'Pump It Up', url: 'https://open.spotify.com/playlist/37i9dQZF1DWY4IZ1ER1yEO' }
    ],
    'fat-loss': [
      { name: 'Cardio Pump', url: 'https://open.spotify.com/playlist/37i9dQZF1DXdPuRRQFMU81' },
      { name: 'Beast Mode', url: 'https://open.spotify.com/playlist/5nj8KmkLhN4zfYhC5sN7ND' }
    ],
    'strength': [
      { name: 'Power Hour', url: 'https://open.spotify.com/playlist/1GLpYqjKZXzJeLhV5VJVAT' },
      { name: 'Powerlifting Mix', url: 'https://open.spotify.com/playlist/37i9dQZF1DWTkb0yYnNfAe' }
    ],
    'endurance': [
      { name: 'Running Flow', url: 'https://open.spotify.com/playlist/37i9dQZF1DX0XUsuxWHw5G' },
      { name: 'Cardio Hit', url: 'https://open.spotify.com/playlist/37i9dQZF1DWY4IZ1ER1yEO' }
    ],
    'general-fitness': [
      { name: 'Workout Mix', url: 'https://open.spotify.com/playlist/3HCbJj2HZKoOePLp9oKa3S' },
      { name: 'All Out Effort', url: 'https://open.spotify.com/playlist/37i9dQZF1DX76Wdecf0gXJ' }
    ],
    'age-well': [
      { name: 'Steady Groove', url: 'https://open.spotify.com/playlist/37i9dQZF1DXdPuRRQFMU81' },
      { name: 'Active Lifestyle', url: 'https://open.spotify.com/playlist/37i9dQZF1DX2sUQwADVAKV' }
    ]
  };

  let playlists = [];
  if (profile.goals && Array.isArray(profile.goals)) {
    profile.goals.forEach(goal => {
      if (playlistDatabase[goal]) {
        playlists.push(playlistDatabase[goal][0]);
      }
    });
  }
  if (playlists.length === 0) {
    playlists = [
      { name: 'Workout Essentials', url: 'https://open.spotify.com/playlist/3HCbJj2HZKoOePLp9oKa3S' }
    ];
  }

  const playlistHtml = playlists.map(p => `
    <div class="playlist-item">
      <h4>${p.name}</h4>
      <p>Handpicked playlist for your training style</p>
      <a href="${p.url}" target="_blank">Listen on Spotify →</a>
    </div>
  `).join('');

  document.getElementById('playlist-container').innerHTML = playlistHtml;

  // Video recommendations database
  const videoDatabase = {
    'muscle-gain': [
      { title: 'Upper Body Hypertrophy Workout', channel: 'Jeff Nippard', duration: '45 min', url: 'https://www.youtube.com/results?search_query=hypertrophy+workout' },
      { title: 'Progressive Overload Guide', channel: 'AthleanX', duration: '12 min', url: 'https://www.youtube.com/results?search_query=progressive+overload' }
    ],
    'fat-loss': [
      { title: 'HIIT Cardio Burn', channel: 'FitnessBlender', duration: '30 min', url: 'https://www.youtube.com/results?search_query=hiit+cardio' },
      { title: 'Fat Loss Nutrition Basics', channel: 'Layne Norton', duration: '18 min', url: 'https://www.youtube.com/results?search_query=fat+loss+nutrition' }
    ],
    'strength': [
      { title: 'Squat Form Master Class', channel: 'Calgary Barbell', duration: '22 min', url: 'https://www.youtube.com/results?search_query=squat+form' },
      { title: 'Deadlift Technique Guide', channel: 'Alan Thrall', duration: '19 min', url: 'https://www.youtube.com/results?search_query=deadlift+form' }
    ],
    'endurance': [
      { title: 'Aerobic Base Building', channel: 'TrainHeroic', duration: '28 min', url: 'https://www.youtube.com/results?search_query=aerobic+base+training' },
      { title: 'Interval Training 101', channel: 'CultFit', duration: '15 min', url: 'https://www.youtube.com/results?search_query=interval+training' }
    ],
    'general-fitness': [
      { title: 'Full Body Workout', channel: 'FitnessBlender', duration: '40 min', url: 'https://www.youtube.com/results?search_query=full+body+workout' },
      { title: 'Recovery and Mobility', channel: 'Bob & Brad', duration: '20 min', url: 'https://www.youtube.com/results?search_query=mobility+recovery' }
    ],
    'age-well': [
      { title: 'Mobility for Longevity', channel: 'GMB Fitness', duration: '25 min', url: 'https://www.youtube.com/results?search_query=mobility+longevity' },
      { title: 'Balance and Stability Training', channel: 'SilverSneakers', duration: '30 min', url: 'https://www.youtube.com/results?search_query=balance+training+seniors' }
    ]
  };

  let videos = [];
  if (profile.goals && Array.isArray(profile.goals)) {
    profile.goals.forEach(goal => {
      if (videoDatabase[goal]) {
        videos.push(videoDatabase[goal][0]);
      }
    });
  }
  if (videos.length === 0) {
    videos = [
      { title: 'Complete Beginner Workout', channel: 'FitnessBlender', duration: '35 min', url: 'https://www.youtube.com/results?search_query=beginner+workout' }
    ];
  }

  const videoHtml = videos.map(v => `
    <div class="video-item">
      <h4>${v.title}</h4>
      <p><strong>${v.channel}</strong> • ${v.duration}</p>
      <a href="${v.url}" target="_blank">Watch on YouTube →</a>
    </div>
  `).join('');

  document.getElementById('video-container').innerHTML = videoHtml;

  // Navigation
  const backToLogs = document.getElementById('back-to-logs');
  const viewPlan = document.getElementById('view-plan');

  if (backToLogs) {
    backToLogs.addEventListener('click', () => {
      window.location.href = '../daily-logs/';
    });
  }

  if (viewPlan) {
    viewPlan.addEventListener('click', () => {
      window.location.href = '../schedule/';
    });
  }
}
