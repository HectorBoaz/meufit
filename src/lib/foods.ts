import type { Food, FoodLogEntry, Portion } from './types';

/**
 * Tabela básica de alimentos – valores aproximados por 100 g,
 * baseados na Tabela Brasileira de Composição de Alimentos (TACO/Unicamp)
 * e, quando ausente na TACO, na USDA FoodData Central.
 * Formato: [id, nome, categoria, kcal, proteína, carboidrato, gordura, porções?]
 */
type Row = [string, string, string, number, number, number, number, Portion[]?];

const U = (label: string, grams: number): Portion => ({ label, grams });
const COLHER_ARROZ = U('colher de sopa cheia', 25);
const ESCUMADEIRA = U('escumadeira', 90);
const CONCHA = U('concha média', 100);
const FATIA_QUEIJO = U('fatia', 20);

const ROWS: Row[] = [
  // Arroz, feijão, massas e grãos
  ['arroz-branco', 'Arroz branco cozido', 'Grãos e massas', 128, 2.5, 28.1, 0.2, [COLHER_ARROZ, ESCUMADEIRA]],
  ['arroz-integral', 'Arroz integral cozido', 'Grãos e massas', 124, 2.6, 25.8, 1.0, [COLHER_ARROZ, ESCUMADEIRA]],
  ['feijao-carioca', 'Feijão carioca cozido', 'Grãos e massas', 76, 4.8, 13.6, 0.5, [CONCHA]],
  ['feijao-preto', 'Feijão preto cozido', 'Grãos e massas', 77, 4.5, 14.0, 0.5, [CONCHA]],
  ['lentilha', 'Lentilha cozida', 'Grãos e massas', 93, 6.3, 16.3, 0.5, [CONCHA]],
  ['grao-de-bico', 'Grão-de-bico cozido', 'Grãos e massas', 164, 8.9, 27.4, 2.6, [U('colher de sopa', 22)]],
  ['macarrao', 'Macarrão cozido', 'Grãos e massas', 158, 5.8, 30.9, 0.9, [U('pegador', 110)]],
  ['cuscuz-milho', 'Cuscuz de milho cozido', 'Grãos e massas', 113, 2.2, 25.3, 0.7, [U('fatia/pedaço', 100)]],
  ['aveia', 'Aveia em flocos', 'Grãos e massas', 394, 13.9, 66.6, 8.5, [U('colher de sopa', 15)]],
  ['farinha-mandioca', 'Farinha de mandioca torrada', 'Grãos e massas', 365, 1.2, 89.2, 0.3, [U('colher de sopa', 16)]],
  ['milho-verde', 'Milho verde em conserva', 'Grãos e massas', 98, 3.2, 17.1, 2.4, [U('colher de sopa', 24)]],

  // Pães e lanches
  ['pao-frances', 'Pão francês', 'Pães e lanches', 300, 8.0, 58.6, 3.1, [U('unidade', 50)]],
  ['pao-forma', 'Pão de forma tradicional', 'Pães e lanches', 253, 12.0, 44.1, 2.7, [U('fatia', 25)]],
  ['pao-forma-integral', 'Pão de forma integral', 'Pães e lanches', 253, 9.4, 49.9, 3.7, [U('fatia', 25)]],
  ['pao-de-queijo', 'Pão de queijo assado', 'Pães e lanches', 363, 5.1, 34.2, 24.6, [U('unidade média', 20)]],
  ['tapioca', 'Tapioca (goma hidratada)', 'Pães e lanches', 240, 0.0, 60.0, 0.0, [U('tapioca média', 50)]],
  ['cream-cracker', 'Biscoito cream cracker', 'Pães e lanches', 432, 10.1, 68.7, 14.4, [U('unidade', 6)]],
  ['biscoito-maisena', 'Biscoito maisena', 'Pães e lanches', 443, 8.1, 75.2, 12.0, [U('unidade', 5)]],
  ['torrada', 'Torrada tradicional', 'Pães e lanches', 377, 10.5, 74.6, 3.3, [U('unidade', 8)]],

  // Carnes, ovos e peixes
  ['ovo-cozido', 'Ovo cozido', 'Carnes e ovos', 146, 13.3, 0.6, 9.5, [U('unidade', 50)]],
  ['ovo-frito', 'Ovo frito', 'Carnes e ovos', 240, 15.6, 1.2, 18.6, [U('unidade', 50)]],
  ['omelete', 'Omelete simples', 'Carnes e ovos', 154, 10.6, 0.6, 11.7, [U('omelete de 2 ovos', 120)]],
  ['frango-peito', 'Peito de frango grelhado', 'Carnes e ovos', 159, 32.0, 0.0, 2.5, [U('filé médio', 100)]],
  ['frango-coxa', 'Coxa de frango assada com pele', 'Carnes e ovos', 215, 28.5, 0.0, 10.4, [U('unidade', 70)]],
  ['frango-desfiado', 'Frango desfiado cozido', 'Carnes e ovos', 163, 31.5, 0.0, 3.2, [U('colher de sopa', 20)]],
  ['patinho', 'Patinho grelhado', 'Carnes e ovos', 219, 35.9, 0.0, 7.3, [U('bife médio', 100)]],
  ['carne-moida', 'Carne moída refogada', 'Carnes e ovos', 212, 26.7, 0.0, 10.9, [U('colher de sopa', 25)]],
  ['alcatra', 'Alcatra grelhada', 'Carnes e ovos', 241, 31.9, 0.0, 11.6, [U('bife médio', 100)]],
  ['picanha', 'Picanha grelhada', 'Carnes e ovos', 289, 26.4, 0.0, 19.5, [U('fatia', 80)]],
  ['lombo-porco', 'Lombo de porco assado', 'Carnes e ovos', 210, 35.7, 0.0, 6.4, [U('fatia', 80)]],
  ['tilapia', 'Tilápia grelhada', 'Carnes e ovos', 128, 26.2, 0.0, 2.7, [U('filé', 120)]],
  ['salmao', 'Salmão grelhado', 'Carnes e ovos', 229, 23.9, 0.0, 14.0, [U('posta', 120)]],
  ['atum-lata', 'Atum em lata (em água)', 'Carnes e ovos', 116, 25.5, 0.0, 0.8, [U('lata drenada', 120)]],
  ['sardinha-lata', 'Sardinha em lata (em óleo)', 'Carnes e ovos', 285, 15.9, 0.0, 24.0, [U('lata drenada', 84)]],
  ['camarao', 'Camarão cozido', 'Carnes e ovos', 90, 19.0, 0.0, 1.0],
  ['presunto', 'Presunto', 'Carnes e ovos', 94, 14.3, 2.1, 2.7, [U('fatia', 15)]],

  // Leite e derivados
  ['leite-integral', 'Leite integral', 'Leite e derivados', 61, 2.9, 4.3, 3.2, [U('copo (200 ml)', 200)]],
  ['leite-desnatado', 'Leite desnatado', 'Leite e derivados', 35, 3.4, 4.9, 0.0, [U('copo (200 ml)', 200)]],
  ['iogurte-natural', 'Iogurte natural integral', 'Leite e derivados', 51, 4.1, 1.9, 3.0, [U('pote', 170)]],
  ['iogurte-desnatado', 'Iogurte natural desnatado', 'Leite e derivados', 41, 3.8, 5.8, 0.3, [U('pote', 170)]],
  ['mucarela', 'Queijo muçarela', 'Leite e derivados', 330, 22.6, 3.0, 25.2, [FATIA_QUEIJO]],
  ['minas-frescal', 'Queijo minas frescal', 'Leite e derivados', 264, 17.4, 3.2, 20.2, [U('fatia', 30)]],
  ['queijo-prato', 'Queijo prato', 'Leite e derivados', 360, 22.7, 1.9, 29.1, [FATIA_QUEIJO]],
  ['parmesao', 'Queijo parmesão', 'Leite e derivados', 453, 35.6, 1.7, 33.5, [U('colher de sopa', 10)]],
  ['cottage', 'Queijo cottage', 'Leite e derivados', 98, 11.1, 3.4, 4.3, [U('colher de sopa', 30)]],
  ['ricota', 'Ricota', 'Leite e derivados', 140, 12.6, 3.8, 8.1, [U('fatia', 30)]],
  ['requeijao', 'Requeijão cremoso', 'Leite e derivados', 257, 9.6, 2.4, 23.4, [U('colher de sopa', 15)]],
  ['manteiga', 'Manteiga', 'Leite e derivados', 726, 0.4, 0.1, 82.4, [U('ponta de faca', 5)]],
  ['whey', 'Whey protein (média)', 'Leite e derivados', 400, 80.0, 8.0, 6.0, [U('scoop', 30)]],

  // Frutas
  ['banana-prata', 'Banana prata', 'Frutas', 98, 1.3, 26.0, 0.1, [U('unidade', 65)]],
  ['banana-nanica', 'Banana nanica', 'Frutas', 92, 1.4, 23.8, 0.1, [U('unidade', 90)]],
  ['maca', 'Maçã com casca', 'Frutas', 56, 0.3, 15.2, 0.0, [U('unidade', 130)]],
  ['laranja', 'Laranja pera', 'Frutas', 37, 1.0, 8.9, 0.1, [U('unidade', 140)]],
  ['tangerina', 'Tangerina (mexerica)', 'Frutas', 38, 0.8, 9.6, 0.1, [U('unidade', 120)]],
  ['mamao-papaia', 'Mamão papaia', 'Frutas', 40, 0.5, 10.4, 0.1, [U('meia unidade', 150)]],
  ['melancia', 'Melancia', 'Frutas', 33, 0.9, 8.1, 0.0, [U('fatia', 200)]],
  ['melao', 'Melão', 'Frutas', 29, 0.7, 7.5, 0.0, [U('fatia', 100)]],
  ['morango', 'Morango', 'Frutas', 30, 0.9, 6.8, 0.3, [U('unidade', 12)]],
  ['abacaxi', 'Abacaxi', 'Frutas', 48, 0.9, 12.3, 0.1, [U('fatia', 75)]],
  ['manga', 'Manga palmer', 'Frutas', 72, 0.4, 19.4, 0.2, [U('unidade', 300)]],
  ['uva', 'Uva itália', 'Frutas', 53, 0.8, 13.6, 0.2, [U('cacho pequeno', 100)]],
  ['pera', 'Pera', 'Frutas', 53, 0.6, 14.0, 0.1, [U('unidade', 130)]],
  ['kiwi', 'Kiwi', 'Frutas', 51, 1.3, 11.5, 0.6, [U('unidade', 75)]],
  ['abacate', 'Abacate', 'Frutas', 96, 1.2, 6.0, 8.4, [U('colher de sopa', 30)]],
  ['goiaba', 'Goiaba vermelha', 'Frutas', 54, 1.1, 13.0, 0.4, [U('unidade', 170)]],
  ['acai-polpa', 'Açaí (polpa, sem açúcar)', 'Frutas', 58, 0.8, 6.2, 3.9, [U('pacote', 100)]],

  // Verduras e legumes
  ['alface', 'Alface', 'Verduras e legumes', 11, 1.3, 1.7, 0.2, [U('prato de sobremesa', 30)]],
  ['tomate', 'Tomate', 'Verduras e legumes', 15, 1.1, 3.1, 0.2, [U('unidade', 100)]],
  ['pepino', 'Pepino', 'Verduras e legumes', 10, 0.9, 2.0, 0.0],
  ['cenoura-crua', 'Cenoura crua', 'Verduras e legumes', 34, 1.3, 7.7, 0.2, [U('colher de sopa ralada', 12)]],
  ['cenoura-cozida', 'Cenoura cozida', 'Verduras e legumes', 30, 0.8, 6.7, 0.2],
  ['brocolis', 'Brócolis cozido', 'Verduras e legumes', 25, 2.1, 4.4, 0.5, [U('ramo', 20)]],
  ['couve-refogada', 'Couve refogada', 'Verduras e legumes', 90, 1.7, 8.7, 6.6, [U('colher de sopa', 20)]],
  ['abobrinha', 'Abobrinha cozida', 'Verduras e legumes', 15, 1.1, 3.0, 0.2],
  ['abobora', 'Abóbora cabotiá cozida', 'Verduras e legumes', 48, 1.4, 10.8, 0.7],
  ['chuchu', 'Chuchu cozido', 'Verduras e legumes', 19, 0.4, 4.8, 0.0],
  ['beterraba', 'Beterraba cozida', 'Verduras e legumes', 32, 1.3, 7.2, 0.1],
  ['batata', 'Batata inglesa cozida', 'Verduras e legumes', 52, 1.2, 11.9, 0.0, [U('unidade média', 130)]],
  ['batata-doce', 'Batata-doce cozida', 'Verduras e legumes', 77, 0.6, 18.4, 0.1, [U('unidade média', 150)]],
  ['mandioca', 'Mandioca cozida', 'Verduras e legumes', 125, 0.6, 30.1, 0.3, [U('pedaço', 70)]],
  ['batata-frita', 'Batata frita', 'Verduras e legumes', 267, 5.0, 35.6, 13.1, [U('porção pequena', 100)]],

  // Oleaginosas, sementes e óleos
  ['azeite', 'Azeite de oliva', 'Óleos e oleaginosas', 884, 0.0, 0.0, 100.0, [U('colher de sopa', 13)]],
  ['oleo', 'Óleo de soja', 'Óleos e oleaginosas', 884, 0.0, 0.0, 100.0, [U('colher de sopa', 13)]],
  ['castanha-para', 'Castanha-do-pará', 'Óleos e oleaginosas', 643, 14.5, 15.1, 63.5, [U('unidade', 4)]],
  ['castanha-caju', 'Castanha de caju', 'Óleos e oleaginosas', 570, 18.5, 29.1, 46.3, [U('unidade', 2.5)]],
  ['amendoim', 'Amendoim torrado', 'Óleos e oleaginosas', 606, 22.5, 18.7, 54.0, [U('punhado', 30)]],
  ['pasta-amendoim', 'Pasta de amendoim', 'Óleos e oleaginosas', 588, 25.0, 20.0, 50.0, [U('colher de sopa', 15)]],
  ['chia', 'Chia', 'Óleos e oleaginosas', 486, 16.5, 42.1, 30.7, [U('colher de sopa', 10)]],
  ['linhaca', 'Linhaça', 'Óleos e oleaginosas', 495, 14.1, 43.3, 32.3, [U('colher de sopa', 10)]],

  // Bebidas
  ['cafe', 'Café sem açúcar', 'Bebidas', 2, 0.1, 0.3, 0.0, [U('xícara (50 ml)', 50)]],
  ['suco-laranja', 'Suco de laranja natural', 'Bebidas', 33, 0.7, 7.6, 0.1, [U('copo (200 ml)', 200)]],
  ['refrigerante', 'Refrigerante (normal)', 'Bebidas', 37, 0.0, 9.5, 0.0, [U('lata (350 ml)', 350)]],
  ['refrigerante-zero', 'Refrigerante zero', 'Bebidas', 0, 0.0, 0.0, 0.0, [U('lata (350 ml)', 350)]],
  ['agua-coco', 'Água de coco', 'Bebidas', 22, 0.0, 5.3, 0.0, [U('copo (200 ml)', 200)]],
  ['cerveja', 'Cerveja', 'Bebidas', 41, 0.3, 3.3, 0.0, [U('lata (350 ml)', 350)]],
  ['vinho', 'Vinho tinto', 'Bebidas', 66, 0.0, 0.2, 0.0, [U('taça (150 ml)', 150)]],

  // Doces e outros
  ['acucar', 'Açúcar', 'Doces e outros', 387, 0.0, 99.5, 0.0, [U('colher de chá', 5)]],
  ['mel', 'Mel', 'Doces e outros', 309, 0.0, 84.0, 0.0, [U('colher de sopa', 20)]],
  ['chocolate-leite', 'Chocolate ao leite', 'Doces e outros', 540, 7.2, 59.6, 30.3, [U('quadradinho', 5)]],
  ['chocolate-amargo', 'Chocolate meio amargo', 'Doces e outros', 475, 4.9, 62.4, 29.9, [U('quadradinho', 5)]],
  ['sorvete', 'Sorvete de creme', 'Doces e outros', 207, 3.5, 23.6, 11.0, [U('bola', 60)]],
  ['maionese', 'Maionese', 'Doces e outros', 302, 0.6, 7.9, 30.5, [U('colher de sopa', 12)]],
  ['feijoada', 'Feijoada', 'Pratos prontos', 117, 8.7, 11.6, 6.5, [CONCHA]],
  ['strogonoff', 'Strogonoff de frango', 'Pratos prontos', 157, 17.6, 2.6, 8.0, [U('colher de servir', 60)]],
];

export const BUILTIN_FOODS: Food[] = ROWS.map(([id, name, category, kcal, protein, carbs, fat, portions]) => ({
  id: `b:${id}`,
  name,
  category,
  baseGrams: 100,
  kcal,
  protein,
  carbs,
  fat,
  portions,
}));

/** Alimentos da tabela, com as edições da usuária por cima, mais os criados por ela. */
export function allFoods(userFoods: Food[]): Food[] {
  const overrides = new Map(userFoods.map((f) => [f.id, f]));
  const merged = BUILTIN_FOODS.map((f) => overrides.get(f.id) ?? f);
  const builtinIds = new Set(BUILTIN_FOODS.map((f) => f.id));
  return [...userFoods.filter((f) => !builtinIds.has(f.id)), ...merged];
}

const ACCENTS: Record<string, string> = {
  á: 'a', à: 'a', â: 'a', ã: 'a', ä: 'a',
  é: 'e', è: 'e', ê: 'e', ë: 'e',
  í: 'i', ì: 'i', î: 'i', ï: 'i',
  ó: 'o', ò: 'o', ô: 'o', õ: 'o', ö: 'o',
  ú: 'u', ù: 'u', û: 'u', ü: 'u',
  ç: 'c', ñ: 'n',
};

/** Minúsculas e sem acentos, para a busca achar "feijao" e "feijão". */
export function normalizeText(s: string) {
  return s
    .toLowerCase()
    .replace(/[áàâãäéèêëíìîïóòôõöúùûüçñ]/g, (ch) => ACCENTS[ch] ?? ch)
    .trim();
}

export function searchFoods(foods: Food[], query: string) {
  const q = normalizeText(query);
  if (!q) return foods;
  const terms = q.split(/\s+/);
  return foods.filter((f) => {
    const name = normalizeText(f.name);
    return terms.every((t) => name.includes(t));
  });
}

function round1(n: number) {
  return Math.round(n * 10) / 10;
}

/** Calcula os valores para uma quantidade em gramas. */
export function nutrientsFor(food: Food, grams: number) {
  const k = food.baseGrams > 0 ? grams / food.baseGrams : 0;
  return {
    kcal: Math.round(food.kcal * k),
    protein: round1((food.protein ?? 0) * k),
    carbs: round1((food.carbs ?? 0) * k),
    fat: round1((food.fat ?? 0) * k),
  };
}

export function sumEntries(entries: FoodLogEntry[]) {
  return entries.reduce(
    (acc, e) => ({
      kcal: acc.kcal + e.kcal,
      protein: round1(acc.protein + e.protein),
      carbs: round1(acc.carbs + e.carbs),
      fat: round1(acc.fat + e.fat),
    }),
    { kcal: 0, protein: 0, carbs: 0, fat: 0 },
  );
}
