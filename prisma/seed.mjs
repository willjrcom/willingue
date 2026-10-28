import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const db = new PrismaClient();
const paths = [
  { id: 'trail-first-steps', title: 'Minha primeira jornada', description: 'Comece a conversar em inglês desde o primeiro dia.', icon: '🚀', color: '#7559ec', position: 1, parentId: null },
  { id: 'trail-greetings', title: 'Hello, world!', description: 'Cumprimentos e apresentações.', icon: '👋', color: '#f5ae43', position: 1, parentId: 'trail-first-steps' },
  { id: 'trail-everyday', title: 'Meu dia a dia', description: 'Palavras para usar todo dia.', icon: '☀️', color: '#45bba4', position: 2, parentId: 'trail-first-steps' },
  { id: 'trail-adventure', title: 'Explorador de palavras', description: 'Descubra novos lugares e sabores.', icon: '🌎', color: '#5687ef', position: 2, parentId: null },
  { id: 'trail-food', title: 'Sabores do mundo', description: 'Peça lanches e descubra comidas.', icon: '🍕', color: '#eb7b9c', position: 1, parentId: 'trail-adventure' },
];
const lessons = [
  { id: 'lesson-hello', pathId: 'trail-greetings', position: 1, title: 'Hello! Como vai?', description: 'Aprenda a cumprimentar seus amigos.', icon: '👋', xpReward: 40, coinReward: 25 },
  { id: 'lesson-my-name', pathId: 'trail-greetings', position: 2, title: 'Nice to meet you', description: 'Diga seu nome e conheça pessoas.', icon: '💬', xpReward: 40, coinReward: 25 },
  { id: 'lesson-morning', pathId: 'trail-everyday', position: 1, title: 'Good morning!', description: 'Fale sobre sua rotina.', icon: '☀️', xpReward: 45, coinReward: 30 },
  { id: 'lesson-school', pathId: 'trail-everyday', position: 2, title: 'At school', description: 'Palavras úteis para a sala de aula.', icon: '🎒', xpReward: 45, coinReward: 30 },
  { id: 'lesson-food', pathId: 'trail-food', position: 1, title: 'I love pizza!', description: 'Comidas e pedidos simples.', icon: '🍕', xpReward: 50, coinReward: 35 },
];
const questions = [
  ['lesson-hello', [
    ['MULTIPLE_CHOICE', 'Como você diz “Olá!” em inglês?', ['Hello!', 'Goodbye!', 'Thanks!', 'Please!'], 'Hello!', 'Hello é uma saudação informal.'],
    ['TRUE_FALSE', '“Goodbye” significa “Até logo” ou “Tchau”.', ['Verdadeiro', 'Falso'], 'Verdadeiro', 'Goodbye é usado nas despedidas.'],
    ['FILL_BLANK', 'Complete: “Good ___!” (Bom dia!)', [], ['morning'], 'Good morning é usado pela manhã.'],
    ['ORDER_WORDS', 'Organize as palavras: “Como você está?”', ['you', 'are', 'How', '?'], ['How', 'are', 'you', '?'], 'How are you? é uma pergunta muito comum.'],
  ]],
  ['lesson-my-name', [
    ['MULTIPLE_CHOICE', 'Qual frase significa “Meu nome é Ana”?', ['My name is Ana.', 'I am hungry.', 'See you soon.', 'What time is it?'], 'My name is Ana.', 'My name is… apresenta seu nome.'],
    ['TRANSLATION', 'Traduza para o inglês: “Prazer em conhecer você”', [], ['Nice to meet you', 'Pleased to meet you'], 'Nice to meet you é a forma mais comum.'],
    ['MATCHING', 'Combine as expressões com seus significados.', [{ left: 'Thank you', choices: ['Obrigado', 'Desculpa', 'Por favor'] }, { left: 'Please', choices: ['Por favor', 'Tchau', 'Oi'] }], ['Obrigado', 'Por favor'], 'Thank you = Obrigado; Please = Por favor.'],
    ['TRUE_FALSE', '“What is your name?” pergunta o nome de alguém.', ['Verdadeiro', 'Falso'], 'Verdadeiro', 'What is your name? = Qual é seu nome?'],
  ]],
  ['lesson-morning', [
    ['MULTIPLE_CHOICE', 'Quando você diz “Good night”?', ['Ao se despedir à noite', 'De manhã cedo', 'Durante o almoço', 'Ao chegar na escola'], 'Ao se despedir à noite', 'Good night é muito usado em despedidas noturnas.'],
    ['ORDER_WORDS', 'Organize: “Eu acordo às sete”', ['at', 'seven', 'wake', 'I', 'up'], ['I', 'wake', 'up', 'at', 'seven'], 'Wake up significa acordar.'],
    ['FILL_BLANK', 'Complete: “I eat ___ in the morning.” (café da manhã)', [], ['breakfast'], 'Breakfast significa café da manhã.'],
  ]],
  ['lesson-school', [
    ['TRANSLATION', 'Traduza: “Eu tenho um livro”', [], ['I have a book'], 'Have expressa posse nessa frase.'],
    ['MULTIPLE_CHOICE', 'O que significa “teacher”?', ['Professor(a)', 'Aluno(a)', 'Caderno', 'Biblioteca'], 'Professor(a)', 'Teacher = professor ou professora.'],
    ['TRUE_FALSE', '“Notebook” pode significar caderno em inglês.', ['Verdadeiro', 'Falso'], 'Verdadeiro', 'Notebook também pode significar caderno.'],
  ]],
  ['lesson-food', [
    ['MULTIPLE_CHOICE', 'Como você pediria água educadamente?', ['Water, please.', 'Water goodbye.', 'I am water.', 'Water morning.'], 'Water, please.', 'Please torna o pedido educado.'],
    ['ORDER_WORDS', 'Organize: “Eu gosto de maçãs”', ['like', 'apples', 'I'], ['I', 'like', 'apples'], 'I like... expressa suas preferências.'],
    ['FILL_BLANK', 'Complete: “I am ___.” (Estou com fome.)', [], ['hungry'], 'Hungry é estar com fome.'],
  ]],
];
const rewards = [
  { id: 'avatar-fox', name: 'Raposa aventureira', description: 'Um novo companheiro para seu perfil.', icon: '🦊', category: 'AVATAR', price: 40, position: 1 },
  { id: 'avatar-unicorn', name: 'Unicórnio mágico', description: 'Deixe seu perfil ainda mais especial.', icon: '🦄', category: 'AVATAR', price: 80, position: 2 },
  { id: 'avatar-robot', name: 'Robô explorador', description: 'Um avatar de outro planeta.', icon: '🤖', category: 'AVATAR', price: 100, position: 3 },
  { id: 'sticker-star', name: 'Figurinha superstar', description: 'Uma figurinha “You rock!” para compartilhar.', icon: '🌟', category: 'STICKER', price: 55, position: 4 },
  { id: 'sticker-owl', name: 'Figurinha corujinha', description: 'Sua corujinha dizendo “Well done!”.', icon: '🦉', category: 'STICKER', price: 75, position: 5 },
  { id: 'frame-champion', name: 'Moldura de campeão', description: 'Personalize uma foto com uma moldura especial.', icon: '🏆', category: 'FRAME', price: 90, position: 6 },
];

async function main() {
  for (const path of paths.filter(p => !p.parentId)) {
    const { id, ...data } = path;
    await db.learningPath.upsert({ where: { id }, create: { id, ...data }, update: {} });
  }
  for (const path of paths.filter(p => p.parentId)) {
    const { id, ...data } = path;
    await db.learningPath.upsert({ where: { id }, create: { id, ...data }, update: {} });
  }
  for (const lesson of lessons) {
    const { id, ...data } = lesson;
    await db.lesson.upsert({ where: { id }, create: { id, ...data }, update: {} });
  }
  for (const [lessonId, items] of questions) {
    for (let i = 0; i < items.length; i++) {
      const [kind, prompt, options, answer, explanation] = items[i];
      const id = `${lessonId}-q${i + 1}`;
      await db.question.upsert({ where: { id }, create: { id, lessonId, position: i + 1, kind, prompt, options: JSON.stringify(options), answer: JSON.stringify(answer), explanation }, update: {} });
    }
  }
  for (const reward of rewards) {
    const { id, ...data } = reward;
    await db.reward.upsert({ where: { id }, create: { id, ...data }, update: {} });
  }
  const passwordHash = await bcrypt.hash('Demo@12345', 12);
  const user = await db.user.upsert({ where: { email: 'aluno@willingue.app' }, create: {
    email: 'aluno@willingue.app', name: 'Alex', passwordHash,
  }, update: { passwordHash } });
  const student = await db.studentProfile.upsert({ where: { userId: user.id }, create: {
    userId: user.id, nickname: 'Alex', xp: 0, coins: 75, selectedAvatar: '🦊', birthDate: new Date('2017-06-10T12:00:00.000Z'),
  }, update: {} });
  await db.notification.upsert({ where: { id: 'demo-welcome-notification' }, create: {
    id: 'demo-welcome-notification', userId: user.id, title: 'Bem-vindo ao Willingue! 👋',
    message: 'Sua jornada começou. Complete sua primeira lição para ganhar XP e moedas!', href: '/aprender',
  }, update: {} });
  await db.activity.upsert({ where: { id: 'demo-activity-hello' }, create: {
    id: 'demo-activity-hello', studentId: student.id, lessonId: 'lesson-hello',
    dueAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
  }, update: {} });
  await db.activity.upsert({ where: { id: 'demo-activity-intro' }, create: {
    id: 'demo-activity-intro', studentId: student.id, lessonId: 'lesson-my-name',
    dueAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  }, update: {} });
  console.log('Demo Willingue pronta: aluno@willingue.app / Demo@12345');
}

main().catch(error => { console.error(error); process.exitCode = 1; }).finally(async () => { await db.$disconnect(); });
