import { useState } from 'react'
import { useRouter } from '../context/RouterContext'

export function slugify(title) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
}

export const allServices = [
  {
    icon: '🧠', iconClass: 'si-green',
    title: 'Individual Therapy',
    desc: 'One-on-one sessions tailored to your unique needs, delivered by certified clinical psychologists. Available online or in-person across Kathmandu.',
    features: ['CBT & DBT approaches', '60-minute sessions', 'Flexible scheduling', 'Session notes shared securely'],
    specialties: ['Anxiety', 'Depression', 'CBT', 'Trauma'],
    duration: '60 minutes', format: 'Online or In-Person', frequency: 'Weekly or Bi-weekly',
    overview: `Individual therapy at Common Psychology is a confidential, one-on-one partnership between you and a licensed clinical psychologist, built around your specific goals rather than a one-size-fits-all program. Whether you're navigating anxiety that makes everyday tasks feel overwhelming, depression that has dimmed your motivation, the lingering effects of past trauma, or simply the ordinary stress of modern life in Kathmandu, our therapists draw on evidence-based frameworks — primarily Cognitive Behavioral Therapy (CBT) and Dialectical Behavior Therapy (DBT) — to help you understand the patterns driving your thoughts, emotions, and behaviors, and to build practical, lasting skills for managing them.

Sessions are 60 minutes, held weekly or bi-weekly depending on what your situation calls for, and can happen entirely online via secure video call or in person at one of our Kathmandu locations — many clients mix both depending on their week. Your first session is focused on understanding your history, current concerns, and what "better" would actually look like for you; from there, your therapist collaborates with you to build a treatment plan that adapts as you progress. We take confidentiality seriously: session notes are stored securely and only shared with your explicit consent, for instance if you're coordinating with a psychiatrist for medication management.

Many clients come to individual therapy without a clear diagnosis in mind — just a sense that something isn't working and a desire to feel more like themselves again. Others arrive already familiar with terms like generalized anxiety disorder or major depressive disorder and want structured, skills-based support. Both are welcome here. Our approach blends clinical rigor with genuine warmth, because we believe healing happens fastest in a relationship where you feel truly heard, not judged.`,
    whoFor: [
      'You feel persistently anxious, low, or overwhelmed and want structured support',
      'You want to understand recurring patterns in your thoughts or relationships',
      'You are working through a specific diagnosis like anxiety, depression, or PTSD',
      'You simply want a confidential space to process life and grow',
    ],
    benefits: [
      'Practical coping tools you can use between sessions',
      'A confidential, non-judgmental space to be fully honest',
      'Measurable progress tracked collaboratively with your therapist',
      'Flexible online or in-person format that fits your schedule',
    ],
    process: [
      { title: 'Initial Assessment', desc: 'Your first session covers your history, current concerns, and goals for therapy in a relaxed, unhurried conversation.' },
      { title: 'Personalized Plan', desc: 'Your therapist proposes a treatment approach — CBT, DBT, or a blend — tailored to what you need.' },
      { title: 'Ongoing Sessions', desc: 'Weekly or bi-weekly 60-minute sessions build skills, track progress, and adjust the plan as you grow.' },
      { title: 'Review & Next Steps', desc: 'Periodic check-ins assess progress and decide together whether to continue, taper, or transition to another service.' },
    ],
    faqs: [
      { q: 'Do I need a diagnosis to start individual therapy?', a: 'Not at all. Many clients start simply because something feels off. Your therapist will help clarify what\'s going on as you go.' },
      { q: 'Can I switch between online and in-person sessions?', a: 'Yes, most clients mix formats depending on their week — just let your therapist know in advance.' },
      { q: 'How long does therapy typically last?', a: 'It varies widely — some clients see meaningful change in 8–12 sessions, others prefer ongoing longer-term support.' },
    ],
  },
  {
    icon: '💑', iconClass: 'si-earth',
    title: 'Couples Counseling',
    desc: 'Rebuild trust, communication, and intimacy with your partner through evidence-based relationship therapy.',
    features: ['Gottman Method', 'Joint & separate sessions', 'Conflict resolution', 'Relationship assessment'],
    specialties: ['Relationship', 'Couples', 'Gottman', 'Communication'],
    duration: '75 minutes', format: 'Online or In-Person', frequency: 'Weekly',
    overview: `Every relationship goes through periods of disconnection — recurring arguments that never quite resolve, a slow drift toward emotional distance, or a specific rupture like an affair or major life change that shakes the foundation of trust. Couples counseling at Common Psychology uses the Gottman Method, one of the most extensively researched approaches to relationship therapy, to help partners identify the specific patterns keeping them stuck and replace them with skills that actually work.

Sessions typically run 75 minutes to allow enough time for both partners to be heard. We usually begin with a joint session to understand the relationship's history and current dynamics, followed by brief individual sessions with each partner separately — this gives each person space to speak openly about their own experience and history without needing to filter for the other's presence. From there, ongoing joint sessions focus on the specific skills your relationship needs most: de-escalating conflict before it spirals, understanding each other's underlying needs and triggers, rebuilding trust after a betrayal, or reconnecting emotionally and physically after a season of distance.

Our therapists remain neutral — we are not here to decide who is "right," but to help both partners understand the dynamic they've co-created and give you tools to change it together. Some couples come in crisis and are considering separation; others are doing well but want to strengthen an already solid relationship before starting a family or facing a major transition. Both are valid reasons to invest in couples work, and both are met with the same evidence-based, judgment-free approach.`,
    whoFor: [
      'You and your partner keep having the same argument without resolution',
      'Trust has been broken and you want structured support rebuilding it',
      'You feel emotionally distant from your partner and want to reconnect',
      'You want to strengthen your relationship before a major life transition',
    ],
    benefits: [
      'Learn to de-escalate conflict before it damages the relationship',
      'Understand your partner\'s underlying needs, not just their words',
      'A neutral, structured space for difficult conversations',
      'Evidence-based tools backed by decades of relationship research',
    ],
    process: [
      { title: 'Joint Intake', desc: 'Both partners meet together to share the relationship\'s history and current concerns.' },
      { title: 'Individual Sessions', desc: 'Each partner meets separately for a candid conversation about their own perspective.' },
      { title: 'Skills-Based Sessions', desc: 'Weekly joint sessions targeting the specific patterns and skills your relationship needs most.' },
      { title: 'Progress Check-ins', desc: 'Regular reviews of what\'s working, with the plan adjusted as the relationship shifts.' },
    ],
    faqs: [
      { q: 'What if only one partner wants to attend?', a: 'Couples work is most effective with both partners, but a single individual therapy session can help you think through how to approach the conversation.' },
      { q: 'Do you take sides in disagreements?', a: 'No — your therapist stays neutral and focuses on the pattern between you both, not on assigning blame.' },
      { q: 'Is couples counseling only for relationships in crisis?', a: 'Not at all. Many couples attend proactively to strengthen a healthy relationship before a big transition.' },
    ],
  },
  {
    icon: '👨‍👩‍👧', iconClass: 'si-blue',
    title: 'Family Therapy',
    desc: 'Strengthen family bonds and work through dynamics that affect everyone in the household.',
    features: ['Family systems approach', 'Parenting support', 'Communication skills', 'Crisis intervention'],
    specialties: ['Family', 'Parenting', 'Crisis', 'Communication'],
    duration: '75 minutes', format: 'In-Person preferred', frequency: 'Weekly or Bi-weekly',
    overview: `Families are systems — when one member is struggling, everyone feels it, and old patterns of communication that once worked can quietly stop serving anyone well. Family therapy at Common Psychology takes a systems-based approach, meaning we look at the family as a whole rather than treating any one member as "the problem." This is especially valuable when a teenager is struggling and parents feel unsure how to help, when siblings are in ongoing conflict, when a major life event like divorce, illness, or relocation has disrupted the household's rhythm, or when generational or cultural differences are creating friction at home.

Sessions typically run 75 minutes and, while we can accommodate remote participation when needed, we recommend in-person sessions for family work whenever possible — being physically present together changes the dynamic of the conversation in ways video calls often can't replicate. Depending on what's happening, sessions may include the whole family together, subsets like just the parents or just the siblings, or a rotation of both, always guided by what will move the family forward fastest.

Our therapists are trained to hold space for multiple perspectives at once without taking sides, helping each family member feel heard while also gently surfacing the communication patterns — the interruptions, the assumptions, the unspoken resentments — that keep conflict circling without resolution. We also provide direct parenting support: practical, culturally-grounded guidance for navigating discipline, communication, and connection with children and teenagers, especially where traditional approaches and a child's individual needs seem to be in tension. For families in acute crisis, we offer more intensive short-term intervention to stabilize the situation before moving into longer-term work.`,
    whoFor: [
      'A family member is struggling and it\'s affecting the whole household',
      'Parents want support navigating conflict or communication with children',
      'The family is adjusting to a major change like divorce, illness, or relocation',
      'Recurring conflict between family members needs a neutral mediator',
    ],
    benefits: [
      'Understand the family\'s dynamic as a whole, not just one member\'s behavior',
      'Practical, culturally-aware parenting strategies',
      'A safe space for every family member\'s voice to be heard',
      'Faster stabilization during acute family crises',
    ],
    process: [
      { title: 'Family Intake', desc: 'An initial session to understand the family structure, history, and current concerns from multiple perspectives.' },
      { title: 'Dynamic Assessment', desc: 'Identifying the recurring communication patterns and roles that are keeping the family stuck.' },
      { title: 'Targeted Sessions', desc: 'Sessions with the whole family or relevant subsets, focused on the specific skills needed.' },
      { title: 'Stabilization & Follow-up', desc: 'For crises, an intensive short-term phase followed by regular sessions to maintain progress.' },
    ],
    faqs: [
      { q: 'Does the whole family need to attend every session?', a: 'Not necessarily — some sessions work best with everyone, others with just a subset, decided together with your therapist.' },
      { q: 'Can family therapy help with a specific child\'s behavior?', a: 'Yes, though we look at it within the family\'s broader dynamic rather than treating the child in isolation.' },
      { q: 'What if family members disagree about attending?', a: 'This is common — your therapist can help facilitate an initial conversation about what family therapy involves before committing.' },
    ],
  },
  {
    icon: '🧒', iconClass: 'si-green',
    title: 'Child Psychology',
    desc: 'Specialized support for children aged 5–18, using play therapy and age-appropriate techniques.',
    features: ['Play therapy', 'Behavioral assessment', 'School-related issues', 'Parent coaching'],
    specialties: ['Children', 'Play Therapy', 'Behavioral', 'Adolescents'],
    duration: '45 minutes', format: 'In-Person preferred', frequency: 'Weekly',
    overview: `Children and adolescents experience and express emotional difficulty very differently from adults — a child rarely says "I feel anxious," but might instead show it through tantrums, withdrawal, sleep trouble, or a sudden drop in school performance. Our child psychology service specializes in working with young people aged 5 to 18, using age-appropriate techniques including play therapy for younger children and more conversational, CBT-informed approaches for teenagers, always calibrated to the child's developmental stage rather than treating them as a small adult.

Sessions run 45 minutes — long enough to build rapport and do meaningful work, short enough to match a child's attention span — and we recommend in-person sessions for younger children especially, since play-based work relies on physical materials and a consistent, safe space. For children, this might mean using toys, art, or storytelling to help them express feelings they don't yet have words for; for teenagers, sessions look more like traditional talk therapy, adapted for adolescent concerns like identity, peer relationships, academic pressure, and family conflict.

We conduct a thorough behavioral assessment early on to understand what's happening across home, school, and social contexts, since a symptom appearing "only at school" or "only with one parent" often tells us something important about its cause. Where school-related issues are contributing — bullying, learning difficulties, attention concerns — we can coordinate with teachers or school counselors with parental consent. Parent coaching is a core part of this service: we regularly meet with parents (without the child present) to share observations, suggest concrete strategies for home, and help you feel equipped rather than helpless when supporting your child between sessions.`,
    whoFor: [
      'Your child shows sudden changes in behavior, mood, or school performance',
      'Your teenager is struggling with anxiety, identity, or peer relationships',
      'You want professional guidance on a specific behavioral concern',
      'Your child has experienced a difficult event and needs support processing it',
    ],
    benefits: [
      'Age-appropriate techniques matched to your child\'s developmental stage',
      'Practical parent coaching so you can support progress at home',
      'Coordination with schools when academic or social issues are involved',
      'A safe, playful space for children to express what they can\'t yet put into words',
    ],
    process: [
      { title: 'Behavioral Assessment', desc: 'Understanding the concern across home, school, and social settings through conversations with parents and the child.' },
      { title: 'Individualized Plan', desc: 'A therapy approach — play-based or conversational — matched to your child\'s age and needs.' },
      { title: 'Weekly Sessions', desc: '45-minute sessions building skills and processing concerns at a pace the child is comfortable with.' },
      { title: 'Parent Coaching', desc: 'Regular separate check-ins with parents to share strategies and progress.' },
    ],
    faqs: [
      { q: 'Will I know what happens in my child\'s sessions?', a: 'We balance the child\'s privacy with keeping parents informed through regular coaching sessions and general updates on progress.' },
      { q: 'What age range do you work with?', a: 'We work with children and adolescents aged 5 through 18, adapting our approach to each developmental stage.' },
      { q: 'Can you coordinate with my child\'s school?', a: 'Yes, with your consent we can liaise with teachers or school counselors when academic or social issues are relevant.' },
    ],
  },
  {
    icon: '🌿', iconClass: 'si-earth',
    title: 'Mindfulness & Stress',
    desc: 'Learn practical mindfulness techniques to manage stress, anxiety, and emotional regulation.',
    features: ['MBSR program', 'Breathing techniques', 'Stress audit', 'Daily practice tools'],
    specialties: ['Mindfulness', 'Stress', 'Anxiety', 'MBSR'],
    duration: '60 minutes', format: 'Online or In-Person', frequency: 'Weekly',
    overview: `Chronic stress doesn't announce itself dramatically — it builds quietly through overcommitted schedules, constant notifications, and a nervous system that never fully gets to switch off, until eventually it shows up as irritability, poor sleep, tension headaches, or a persistent low-grade anxiety that feels hard to name. Our Mindfulness & Stress service is built around Mindfulness-Based Stress Reduction (MBSR), a structured, well-researched program that teaches practical skills for recognizing stress early and responding to it deliberately rather than reactively.

We begin with a thorough stress audit — mapping out where stress is actually coming from in your life, how it shows up physically and emotionally, and which of your current coping strategies are helping versus quietly making things worse. From there, sessions run 60 minutes weekly and combine guided breathing techniques, body-based awareness practices, and cognitive strategies for catching stress-amplifying thought patterns before they spiral. This isn't generic relaxation content — it's a structured curriculum adapted to your specific stressors, whether that's work pressure, academic demands, caregiving responsibilities, or general overstimulation from modern life.

A key part of this service is building daily practice tools you can use entirely on your own between sessions: short breathing exercises for acute stress spikes, brief mindfulness check-ins to build over time, and simple techniques for winding down before sleep. The goal isn't to eliminate stress from your life — that's rarely realistic — but to change your relationship with it, so that stress passes through you rather than accumulating and eventually overwhelming your capacity to function well.`,
    whoFor: [
      'You feel persistently stressed, wound-up, or unable to switch off',
      'You want practical tools for anxiety rather than open-ended talk therapy',
      'Work, caregiving, or academic pressure is affecting your wellbeing',
      'You\'re interested in mindfulness but don\'t know where to start',
    ],
    benefits: [
      'A structured, evidence-based program rather than generic advice',
      'Practical daily tools you can use independently between sessions',
      'Better sleep, focus, and emotional regulation over time',
      'A personalized stress audit identifying your specific triggers',
    ],
    process: [
      { title: 'Stress Audit', desc: 'Mapping your specific stressors, physical symptoms, and current coping patterns.' },
      { title: 'Foundational Skills', desc: 'Learning core breathing and body-awareness techniques in your first few sessions.' },
      { title: 'Applied Practice', desc: 'Weekly sessions building on the skills, tailored to your real-life stress triggers.' },
      { title: 'Independent Toolkit', desc: 'Building a set of daily practices you can rely on long after sessions end.' },
    ],
    faqs: [
      { q: 'Is this the same as meditation classes?', a: 'It\'s more structured and personalized — MBSR is a clinically-researched program, and sessions are tailored to your specific stress patterns.' },
      { q: 'How quickly will I see results?', a: 'Many clients notice improved sleep and reduced reactivity within a few weeks of consistent practice.' },
      { q: 'Do I need any prior experience with mindfulness?', a: 'No prior experience is needed — the program is designed to build skills from the ground up.' },
    ],
  },
  {
    icon: '😴', iconClass: 'si-blue',
    title: 'Sleep & Mood',
    desc: 'Address insomnia, burnout, and mood disorders with targeted therapeutic interventions.',
    features: ['CBT for insomnia', 'Mood charting', 'Sleep hygiene coaching', 'Lifestyle integration'],
    specialties: ['Insomnia', 'Sleep', 'Mood', 'Burnout'],
    duration: '60 minutes', format: 'Online or In-Person', frequency: 'Weekly',
    overview: `Sleep and mood are deeply intertwined — poor sleep worsens mood regulation, and low mood in turn disrupts sleep, creating a cycle that's difficult to break without targeted intervention. Our Sleep & Mood service addresses this directly using Cognitive Behavioral Therapy for Insomnia (CBT-I), the gold-standard, non-medication approach to chronic sleep difficulties, combined with mood-focused work for clients dealing with burnout or mood disorders that are tangled up with sleep problems.

Sessions run 60 minutes weekly and begin with careful mood charting and sleep tracking — understanding your actual sleep patterns, what happens in the hour before bed, how your mood fluctuates through the day and week, and what's maintaining the cycle. From there, we work through specific CBT-I techniques: restructuring unhelpful beliefs about sleep, adjusting sleep-wake scheduling to rebuild your body's natural rhythm, and addressing the racing thoughts or worry that often keep people awake even when exhausted.

For clients experiencing burnout — that particular blend of exhaustion, cynicism, and reduced effectiveness that builds up from chronic overwork — we look beyond sleep alone to the broader lifestyle factors driving it: workload, boundaries, recovery time, and the beliefs that make it hard to slow down. Sleep hygiene coaching translates clinical recommendations into realistic changes for your actual daily life rather than an idealized routine you'll never follow. We integrate these changes gradually, because sustainable improvement in sleep and mood comes from small, consistent shifts rather than dramatic overnight changes that are hard to maintain.`,
    whoFor: [
      'You struggle to fall asleep, stay asleep, or wake up unrested',
      'You\'re experiencing burnout from chronic work or life demands',
      'Your mood fluctuates in ways connected to poor sleep',
      'You\'ve tried general sleep advice without lasting improvement',
    ],
    benefits: [
      'Evidence-based CBT-I, the most effective non-medication insomnia treatment',
      'Personalized sleep hygiene coaching that fits your real life',
      'Mood charting to identify what\'s driving your cycle of poor sleep and low mood',
      'Sustainable, gradual lifestyle integration rather than unrealistic overhauls',
    ],
    process: [
      { title: 'Sleep & Mood Tracking', desc: 'A period of careful tracking to understand your actual patterns before making changes.' },
      { title: 'CBT-I Techniques', desc: 'Structured sessions addressing sleep beliefs, scheduling, and pre-sleep routines.' },
      { title: 'Mood-Focused Work', desc: 'Addressing burnout or mood symptoms that are tangled with the sleep difficulty.' },
      { title: 'Lifestyle Integration', desc: 'Gradually building sustainable habits rather than a rigid, hard-to-maintain routine.' },
    ],
    faqs: [
      { q: 'Will I need to stop taking sleep medication?', a: 'We work alongside your prescribing doctor — this service doesn\'t manage medication but complements it with behavioral techniques.' },
      { q: 'How long does CBT-I typically take?', a: 'Most clients see meaningful improvement within 6–8 weekly sessions, though this varies by individual.' },
      { q: 'Can this help with burnout even if my sleep is okay?', a: 'Yes — we address the broader lifestyle and mood factors driving burnout, not just sleep alone.' },
    ],
  },
  {
    icon: '💼', iconClass: 'si-blue',
    title: 'Organizational Wellness',
    desc: 'Support for workplace mental health and employee well-being.',
    features: ['Workplace assessments', 'Employee assistance', 'Leadership training', 'Culture of care'],
    specialties: ['Workplace', 'Employee', 'Leadership', 'Culture'],
    duration: 'Varies by program', format: 'On-site or Online', frequency: 'Custom schedule',
    overview: `Employee mental health directly shapes organizational performance, yet many workplaces still lack structured support for it. Our Organizational Wellness service partners with businesses and institutions across Nepal to build genuine, sustainable mental health infrastructure — not a one-off wellness day, but ongoing systems that support employees through their working life.

We begin with a workplace assessment: understanding your organization's specific stressors, culture, and existing support structures through confidential surveys and interviews across levels of the organization. From there, we design a program suited to your needs, which may include an Employee Assistance Program (EAP) giving staff confidential access to individual counseling sessions, leadership training equipping managers to recognize and appropriately respond to mental health concerns in their teams, and organization-wide initiatives aimed at building a genuine culture of psychological safety rather than one that merely talks about wellness.

Leadership training is often the highest-leverage part of this work — managers are usually the first to notice when someone is struggling, but rarely feel equipped to respond well, and can inadvertently make things worse through good intentions poorly executed. We train leaders in practical skills: how to have a supportive conversation without overstepping into clinical territory, when and how to refer someone to professional support, and how to model healthy boundaries themselves. For organizations further along this journey, we help embed mental health considerations into broader policy — workload management, leave structures, and return-to-work processes after a mental health absence.

Every program is customized: session frequency, format, and scope depend on your organization's size, industry, and specific goals, whether that's addressing a specific crisis, building preventative infrastructure, or simply starting the conversation for the first time.`,
    whoFor: [
      'Your organization wants to establish or improve employee mental health support',
      'Leadership needs training to better support struggling team members',
      'You\'re seeing signs of burnout or disengagement across your workforce',
      'You want to build a genuine culture of psychological safety, not just a wellness poster',
    ],
    benefits: [
      'A confidential, structured Employee Assistance Program for your staff',
      'Practical leadership training grounded in real workplace scenarios',
      'Reduced turnover and absenteeism through better-supported employees',
      'A customized program that fits your organization\'s size and culture',
    ],
    process: [
      { title: 'Workplace Assessment', desc: 'Confidential surveys and interviews to understand your organization\'s specific needs.' },
      { title: 'Program Design', desc: 'A customized combination of EAP, leadership training, and cultural initiatives.' },
      { title: 'Rollout', desc: 'Implementation across your organization, on-site or online depending on your setup.' },
      { title: 'Ongoing Support', desc: 'Regular check-ins and program adjustments as your organization\'s needs evolve.' },
    ],
    faqs: [
      { q: 'How is this priced for organizations?', a: 'Pricing depends on organization size and program scope — contact us for a customized quote.' },
      { q: 'Is employee participation confidential?', a: 'Yes — individual counseling sessions through an EAP remain fully confidential from the employer.' },
      { q: 'Can we start with just leadership training?', a: 'Absolutely — many organizations start there before expanding into a full EAP.' },
    ],
  },
  {
    icon: '🗨️', iconClass: 'si-green',
    title: 'General Counseling',
    desc: 'Talk through everyday challenges, life transitions, or emotional struggles with a supportive, non-judgmental counselor.',
    features: ['Life transitions support', 'Emotional wellness check-ins', 'Confidential sessions', 'Personalized coping strategies'],
    specialties: ['Counseling', 'Life Transitions', 'Emotional Support', 'Wellness'],
    duration: '50 minutes', format: 'Online or In-Person', frequency: 'Weekly or As-needed',
    overview: `Not every difficult chapter of life requires a clinical diagnosis to warrant support — sometimes you just need a confidential, non-judgmental space to think out loud about a decision, process a difficult conversation, or simply feel less alone while navigating change. Our General Counseling service is designed exactly for this: flexible, supportive sessions for everyday emotional struggles and life transitions that don't necessarily fit neatly into a specific therapeutic category.

Sessions run 50 minutes and can be scheduled weekly for ongoing support or on an as-needed basis for specific situations — a career change, a move to a new city, becoming a parent, navigating a friendship falling apart, or simply feeling stuck and wanting to talk it through with someone trained to listen well. Your counselor won't rush to diagnose or pathologize what you're going through; instead, the focus is on understanding your situation, validating what you're feeling, and helping you build personalized coping strategies that fit your actual life and values.

We offer regular emotional wellness check-ins for clients who want ongoing, lower-intensity support — a space to process the week, notice patterns, and stay accountable to their own wellbeing without needing to be in acute distress to justify it. Confidentiality is central to this work, giving you full freedom to speak honestly about family, relationships, career, or personal doubts without worrying about judgment. Many clients find that this kind of steady, supportive space becomes a valuable long-term habit — not because something is wrong, but because having a place to process life consistently makes everything else easier to handle.`,
    whoFor: [
      'You\'re navigating a life transition and want support processing it',
      'You want a confidential space to talk through everyday struggles',
      'You\'re not sure if what you\'re feeling warrants "real" therapy',
      'You want ongoing emotional check-ins rather than crisis-driven sessions',
    ],
    benefits: [
      'Flexible scheduling that fits your actual need, not a rigid program',
      'A judgment-free space for everyday struggles, big or small',
      'Personalized coping strategies rather than generic advice',
      'A supportive habit that builds long-term emotional resilience',
    ],
    process: [
      { title: 'Getting Started', desc: 'An initial conversation about what\'s on your mind and what kind of support would help most.' },
      { title: 'Flexible Sessions', desc: 'Weekly or as-needed 50-minute sessions, scheduled around your life rather than a fixed program.' },
      { title: 'Coping Strategies', desc: 'Practical, personalized tools for whatever you\'re currently navigating.' },
      { title: 'Ongoing Check-ins', desc: 'Continued support for as long as it\'s useful, with no pressure to "graduate" on a schedule.' },
    ],
    faqs: [
      { q: 'Do I need a specific problem to book general counseling?', a: 'No — many clients come simply because they want a supportive space, without a specific crisis or diagnosis.' },
      { q: 'How is this different from individual therapy?', a: 'General counseling is more flexible and less structured, ideal for everyday support rather than treating a specific clinical condition.' },
      { q: 'Can I switch to individual therapy later if needed?', a: 'Yes, your counselor can help you transition to a more structured service if that becomes appropriate.' },
    ],
  },
  {
    icon: '🕊️', iconClass: 'si-earth',
    title: 'Grief & Loss Counseling',
    desc: 'Compassionate support for processing grief after the loss of a loved one, relationship, or major life change.',
    features: ['Grief processing techniques', 'Individual & family sessions', 'Coping with loss', 'Memory & meaning-making work'],
    specialties: ['Grief', 'Loss', 'Bereavement', 'Family'],
    duration: '60 minutes', format: 'Online or In-Person', frequency: 'Weekly or Bi-weekly',
    overview: `Grief doesn't follow a predictable timeline, and it doesn't only follow death — it can arise from divorce, the loss of a job or identity, estrangement from family, or any major life change that involves letting go of something that mattered. Our Grief & Loss Counseling service offers compassionate, unhurried support for processing loss in whatever form it takes, without pressure to move through it faster than feels genuine.

Sessions run 60 minutes, typically weekly in the early period after a loss and shifting to bi-weekly as things stabilize, though this is always guided by what you need rather than a fixed schedule. We use established grief processing techniques to help you understand the range of emotions that often accompany loss — sadness, anger, guilt, relief, and sometimes numbness — normalizing whichever combination shows up for you rather than expecting grief to look a particular way. Both individual sessions and family sessions are available, since loss often affects an entire household differently, and sometimes the most valuable work happens when family members process it together with professional guidance.

A significant part of this work is memory and meaning-making — not "getting over" a loss, but finding a way to carry it forward that allows you to remain connected to what you've lost while still being able to engage with life again. This might involve exploring rituals of remembrance, working through unfinished emotional business with someone who has died, or making sense of who you are now after a major identity-altering loss. We also help with the practical side of coping: managing grief triggers, navigating others' well-meaning but sometimes unhelpful responses, and rebuilding a sense of routine and purpose at a pace that respects where you actually are.`,
    whoFor: [
      'You\'ve lost a loved one and need support processing your grief',
      'You\'re grieving a relationship, job, or major life change, not only a death',
      'Your family is struggling to process a shared loss together',
      'You feel stuck in grief and want support finding a way forward',
    ],
    benefits: [
      'A compassionate space with no pressure to grieve on a timeline',
      'Both individual and family sessions depending on what\'s needed',
      'Meaning-making work that helps you carry loss forward, not "move on" from it',
      'Practical strategies for grief triggers and difficult anniversaries',
    ],
    process: [
      { title: 'Initial Support', desc: 'An early session to understand your loss, your history, and the immediate support you need.' },
      { title: 'Processing Sessions', desc: 'Weekly sessions working through the range of emotions grief brings, at your own pace.' },
      { title: 'Meaning-Making Work', desc: 'Exploring how to carry the loss forward while re-engaging with life and purpose.' },
      { title: 'Ongoing or Tapering Support', desc: 'Sessions shift to bi-weekly or as-needed as things stabilize, always guided by your needs.' },
    ],
    faqs: [
      { q: 'How soon after a loss should I start counseling?', a: 'Whenever feels right for you — some people start immediately, others wait weeks or months, and both are completely valid.' },
      { q: 'Is grief counseling only for losing a person to death?', a: 'No — we support grief from any significant loss, including relationships, jobs, and major life changes.' },
      { q: 'Can my whole family attend sessions together?', a: 'Yes, we offer family sessions alongside individual work when a shared loss is affecting the household.' },
    ],
  },
  {
    icon: '🌱', iconClass: 'si-blue',
    title: 'Trauma Counseling',
    desc: 'Specialized, trauma-informed therapy to help you process difficult experiences and rebuild a sense of safety.',
    features: ['Trauma-informed approach', 'EMDR & grounding techniques', 'Safe, paced sessions', 'Nervous system regulation support'],
    specialties: ['Trauma', 'PTSD', 'EMDR', 'Safety'],
    duration: '60 minutes', format: 'Online or In-Person', frequency: 'Weekly',
    overview: `Trauma reshapes how the nervous system responds to the world — often leaving people hypervigilant, easily overwhelmed, disconnected from their own emotions, or stuck reliving difficult experiences long after the danger has passed. Our Trauma Counseling service takes a trauma-informed approach from the very first session, meaning every part of the process — pacing, technique, and the therapeutic relationship itself — is designed around rebuilding a felt sense of safety before asking you to process difficult material directly.

Sessions run 60 minutes weekly and may incorporate Eye Movement Desensitization and Reprocessing (EMDR), a well-researched technique for processing traumatic memories that reduces their emotional intensity without requiring you to recount every detail verbally, alongside grounding techniques that help regulate the nervous system in the moment when distress spikes. We never push you to process trauma faster than feels safe — pacing is collaborative, and your therapist will check in continuously about what you're ready for, since re-traumatization from moving too fast is a real risk we actively guard against.

A core focus of this work is nervous system regulation — teaching your body, not just your mind, that it's safe now. This might involve breathing techniques, body-based grounding exercises, and building a toolkit for managing flashbacks, panic, or dissociation between sessions. Whether your trauma stems from a single incident, prolonged childhood experiences, or ongoing situations like domestic violence or community conflict, our therapists are trained to work at whatever depth feels right for you — sometimes that means directly processing the traumatic memory, and sometimes it means first spending significant time simply building safety and stability before going anywhere near the trauma itself.`,
    whoFor: [
      'You\'ve experienced a traumatic event and it continues to affect you',
      'You have symptoms of PTSD like flashbacks, hypervigilance, or avoidance',
      'You experienced prolonged difficult circumstances, such as childhood adversity',
      'You want trauma-focused techniques like EMDR alongside talk therapy',
    ],
    benefits: [
      'A carefully paced, trauma-informed approach that prioritizes your safety',
      'Access to EMDR, a leading evidence-based trauma processing technique',
      'Practical nervous system regulation tools for daily life',
      'A collaborative pace — nothing is pushed faster than feels safe',
    ],
    process: [
      { title: 'Safety & Stabilization', desc: 'Early sessions focus on building a felt sense of safety and teaching regulation tools before processing trauma directly.' },
      { title: 'Assessment', desc: 'Understanding your history and symptoms to decide the right pacing and techniques for you.' },
      { title: 'Processing Work', desc: 'When you\'re ready, techniques like EMDR help process traumatic memories at a manageable pace.' },
      { title: 'Integration', desc: 'Ongoing sessions help integrate progress and build resilience for the future.' },
    ],
    faqs: [
      { q: 'Will I have to describe the traumatic event in detail?', a: 'Not necessarily — techniques like EMDR are specifically designed to reduce the need for detailed verbal recounting.' },
      { q: 'How do I know if I need trauma counseling versus general therapy?', a: 'If a specific event or period continues to affect your daily functioning, sleep, or sense of safety, trauma-informed support is likely the right fit.' },
      { q: 'What if I\'m not ready to talk about what happened yet?', a: 'That\'s completely normal — early sessions focus entirely on building safety and stability, with no pressure to process the trauma before you\'re ready.' },
    ],
  },
]

const allTags = ['All', ...Array.from(new Set(allServices.flatMap(s => s.specialties)))]

// ── Glass card palette ─────────────────────────────────────────
const GLASS = {
  bg:        'linear-gradient(160deg, rgba(255,255,255,0.72) 0%, rgba(214,238,252,0.55) 55%, rgba(255,255,255,0.68) 100%)',
  bgHover:   'linear-gradient(160deg, rgba(255,255,255,0.82) 0%, rgba(200,232,250,0.68) 55%, rgba(255,255,255,0.78) 100%)',
  border:    '1px solid rgba(255,255,255,0.55)',
  borderHov: '1px solid rgba(120,190,230,0.65)',
}

export default function ServicesPage() {
  const { navigate } = useRouter()
  const [activeTag, setActiveTag] = useState('All')
  const [hoveredIdx, setHoveredIdx] = useState(null)

  const visibleServices = activeTag === 'All'
    ? allServices
    : allServices.filter(s => s.specialties.includes(activeTag))

  return (
    <div className="page-wrapper">
      <div
        className="page-hero"
        style={{
          position: 'relative',
          overflow: 'hidden',
          padding: '4rem 2rem 5rem',
          textAlign: 'center',
          borderRadius: '0 0 60% 60% / 0 0 40px 40px',
          background: `
            radial-gradient(ellipse 80% 60% at 20% 40%, rgba(180,230,210,0.55) 0%, transparent 70%),
            radial-gradient(ellipse 70% 80% at 80% 20%, rgba(186,220,248,0.5) 0%, transparent 65%),
            radial-gradient(ellipse 60% 50% at 60% 80%, rgba(254,243,199,0.45) 0%, transparent 60%),
            linear-gradient(160deg, #f0faf5 0%, #e8f4fb 45%, #fefce8 100%)
          `,
        }}
      >
        <div style={{
          position: 'absolute', width: 220, height: 220, borderRadius: '50%',
          background: 'rgba(0,123,168,0.12)', filter: 'blur(32px)',
          top: -40, right: '5%', pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', width: 180, height: 180, borderRadius: '50%',
          background: 'rgba(29,158,117,0.1)', filter: 'blur(32px)',
          bottom: -20, left: '8%', pointerEvents: 'none',
        }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 560, margin: '0 auto' }}>
          <span className="section-tag">All Services</span>
          <h1 className="section-title">Everything You Need for <em>Mental Wellness</em></h1>
          <p className="section-desc">
            Comprehensive, evidence-based mental health services designed for the Nepali community.
          </p>
        </div>
      </div>

      <div className="section" style={{ background: 'var(--white)' }}>

        {/* Filter bar */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: '0.6rem',
            marginBottom: '3rem',
            padding: '0 1rem',
          }}
        >
          {allTags.map(tag => {
            const active = tag === activeTag
            return (
              <button
                key={tag}
                onClick={() => setActiveTag(tag)}
                style={{
                  border: active ? '1px solid transparent' : '1px solid #d8e3df',
                  background: active
                    ? 'linear-gradient(135deg, #1d9e75, #007ba8)'
                    : '#fff',
                  color: active ? '#fff' : '#3a4a45',
                  padding: '0.5rem 1.1rem',
                  borderRadius: '999px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: active ? '0 4px 14px rgba(29,158,117,0.3)' : '0 1px 3px rgba(0,0,0,0.04)',
                  transform: active ? 'translateY(-1px)' : 'none',
                  transition: 'all 0.2s ease',
                }}
              >
                {tag}
              </button>
            )
          })}
        </div>

        <div className="services-grid-full">
          {visibleServices.map((s, i) => {
            const isHovered = hoveredIdx === i
            return (
              <div
                className="service-card-full"
                key={s.title}
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
                style={{
                  position: 'relative',
                  cursor: 'pointer',
                  background: isHovered ? GLASS.bgHover : GLASS.bg,
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                  border: isHovered ? GLASS.borderHov : GLASS.border,
                  transform: isHovered ? 'translateY(-8px) scale(1.015)' : 'translateY(0) scale(1)',
                  boxShadow: isHovered
                    ? '0 20px 44px rgba(0,123,168,0.22), 0 6px 16px rgba(29,158,117,0.14), inset 0 1px 0 rgba(255,255,255,0.6)'
                    : '0 4px 18px rgba(0,123,168,0.10), inset 0 1px 0 rgba(255,255,255,0.5)',
                  borderRadius: '20px',
                  transition: 'transform 0.35s cubic-bezier(0.22,1,0.36,1), box-shadow 0.35s ease, background 0.35s ease, border 0.35s ease',
                  animation: `fadeSlideIn 0.5s ease both`,
                  animationDelay: `${i * 0.06}s`,
                }}
                onClick={() => navigate('/book', { serviceTitle: s.title, serviceSpecialties: s.specialties })}
              >
                <div
                  className={`service-icon ${s.iconClass}`}
                  style={{
                    transform: isHovered ? 'scale(1.12) rotate(-4deg)' : 'scale(1)',
                    transition: 'transform 0.3s ease',
                  }}
                >
                  {s.icon}
                </div>

                <h3 className="service-card-title">{s.title}</h3>
                <p className="service-card-desc">{s.desc}</p>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '0.75rem' }}>
                  {s.specialties.map(tag => (
                    <span
                      key={tag}
                      onClick={(e) => { e.stopPropagation(); setActiveTag(tag) }}
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        padding: '0.2rem 0.6rem',
                        borderRadius: '999px',
                        background: 'rgba(29,158,117,0.1)',
                        backdropFilter: 'blur(4px)',
                        border: '1px solid rgba(29,158,117,0.15)',
                        color: '#1d9e75',
                        cursor: 'pointer',
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <ul className="service-card-features">
                  {s.features.map((f, j) => (
                    <li key={j}>
                      <span className="service-card-check">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>

                <button
                  className="btn btn-primary service-card-btn"
                  style={{
                    background: 'linear-gradient(135deg, #007ba8 0%, #00bfff 100%)',
                    boxShadow: '0 6px 18px rgba(0,150,210,0.3)',
                    border: 'none',
                  }}
                  onClick={(e) => {
                    e.stopPropagation()
                    navigate('/book', { serviceTitle: s.title, serviceSpecialties: s.specialties })
                  }}
                >
                  Book This Service
                </button>
              </div>
            )
          })}
        </div>

        {visibleServices.length === 0 && (
          <p style={{ textAlign: 'center', color: '#7a8a85', marginTop: '2rem' }}>
            No services match that filter.
          </p>
        )}
      </div>

      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}