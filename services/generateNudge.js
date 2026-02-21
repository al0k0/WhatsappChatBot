const nudges = [

`👋 Hi there!

Still exploring courses?

I can help you choose the best option based on your goal 🙂`,

`Hey 👋

Not sure which course is right for you?

Tell me your goal — job, skills, or career switch — and I’ll guide you.`,

`Hi 🙂

Confused between options?

I can suggest the *most in-demand course* right now.`,

`👋 Just checking in...

Do you want a course that leads to **job opportunities quickly**?`,

`Hey!

Many students ask which course gives the fastest job results.

Want me to suggest one? 🚀`,

`Hi 👋

If you're unsure where to start, I can recommend the best course for beginners.`,

`🙂 Need help deciding?

I can guide you based on:

✔ your interest  
✔ time availability  
✔ job goals`,

`Hey 👋

Want to know which course has the **highest placement demand** right now?`,

`Hi!

Still thinking?

I can help you pick a course that matches your future plans.`,

`👋 Quick question:

Are you looking to:

1️⃣ Get a job  
2️⃣ Upgrade skills  
3️⃣ Start freelancing  

Reply with the number 🙂`,

`Hi 🙂

Many students start with guidance.

Tell me what you want to achieve — I’ll help you choose.`,

`Hey 👋

Choosing the right course can save months of time.

Want a quick recommendation?`

];

function generateNudge() {
  return nudges[Math.floor(Math.random() * nudges.length)];
}

module.exports = generateNudge;