// preprocess_training_data.js
// This converts your training data into optimized format

const fs = require('fs');

// Load raw training data
const rawData = JSON.parse(
  fs.readFileSync('./rajesh_kumar_training_data.json', 'utf8')
);

// Build intent index for fast lookup
const intentIndex = {};
const allUserInputs = [];

rawData.conversation_data.forEach((intent) => {
  // Normalize each user input
  intent.user_inputs.forEach((input) => {
    const normalized = input.toLowerCase().trim();
    allUserInputs.push({
      original: input,
      normalized: normalized,
      intent: intent.intent,
      tokens: normalized.split(' '),
    });
  });

  // Store intent data
  intentIndex[intent.intent] = {
    responses: intent.character_responses,
    follow_ups: intent.follow_up_likely || [],
    context_required: intent.context_requirements || [],
  };
});

// Build keyword-to-intent mapping
const keywordMap = {};
allUserInputs.forEach((input) => {
  input.tokens.forEach((token) => {
    if (token.length > 3) {
      // Ignore short words
      if (!keywordMap[token]) {
        keywordMap[token] = [];
      }
      if (!keywordMap[token].includes(input.intent)) {
        keywordMap[token].push(input.intent);
      }
    }
  });
});

// Save processed data
const processedData = {
  character: rawData.character_profile,
  intents: intentIndex,
  keywords: keywordMap,
  inputs: allUserInputs,
  emotions: rawData.emotional_transitions,
  trust: rawData.trust_system,
};

fs.writeFileSync(
  './rajesh_kumar_processed.json',
  JSON.stringify(processedData, null, 2)
);

console.log('✅ Training data processed successfully!');
console.log(`📊 Total intents: ${Object.keys(intentIndex).length}`);
console.log(`📝 Total training examples: ${allUserInputs.length}`);
console.log(`🔑 Keywords mapped: ${Object.keys(keywordMap).length}`);