import { describe, it, expect } from 'vitest';
import {
  findExerciseInDatabase,
  isRecognizedExercise,
  isFitnessContext,
  searchExercises,
  generateDynamicExercise,
  EXERCISE_DATABASE,
} from './exerciseDatabase';

describe('exerciseDatabase', () => {
  describe('findExerciseInDatabase', () => {
    it('veritabanındaki bir hareketi tam adıyla bulur', () => {
      const ex = findExerciseInDatabase('Barbell Back Squat');
      expect(ex.id).toBe('barbell-squat');
    });

    it('Türkçe karakterleri ve büyük/küçük harfi yok sayar', () => {
      // normalizeText: Şınav -> 'sinav' alias'ına, PUSH-UP -> 'push up' alias'ına iner
      expect(findExerciseInDatabase('Şınav').id).toBe('push-up');
      expect(findExerciseInDatabase('PUSH-UP').id).toBe('push-up');
    });

    it('takma adlarla (alias) eşleşir', () => {
      expect(findExerciseInDatabase('barfiks').id).toBe('pull-ups');
      expect(findExerciseInDatabase('squat').id).toBe('barbell-squat');
    });

    it('bilinmeyen bir başlıkta asla null dönmez; dinamik kayıt üretir', () => {
      const ex = findExerciseInDatabase('Zemberek çevirme hareketi');
      expect(ex.id.startsWith('dynamic-')).toBe(true);
      expect(ex.name).toBeTruthy();
      expect(ex.instructions.length).toBeGreaterThan(0);
    });

    it('boş sorguda dinamik "genel" kayıt döner', () => {
      const ex = findExerciseInDatabase('   ');
      expect(ex.id.startsWith('dynamic-')).toBe(true);
    });
  });

  describe('isRecognizedExercise', () => {
    it('bilinen hareketler için true döner', () => {
      expect(isRecognizedExercise('Push-up')).toBe(true);
      expect(isRecognizedExercise('barfiks')).toBe(true);
    });

    it('genel iş görevleri için false döner', () => {
      expect(isRecognizedExercise('API geliştirmek')).toBe(false);
      expect(isRecognizedExercise('müşteri teklifi hazırla')).toBe(false);
      expect(isRecognizedExercise('toplantı özeti yaz')).toBe(false);
    });

    it('boş/eksik metin için false döner', () => {
      expect(isRecognizedExercise(undefined)).toBe(false);
      expect(isRecognizedExercise('')).toBe(false);
    });
  });

  describe('isFitnessContext', () => {
    it('fitness anahtar kelimelerini tespit eder', () => {
      expect(isFitnessContext('Spor Salonu')).toBe(true);
      expect(isFitnessContext('Antrenman Programı')).toBe(true);
      expect(isFitnessContext('Workout Board')).toBe(true);
      expect(isFitnessContext('crossfit takibi')).toBe(true);
    });

    it('fitness dışı metinler için false döner', () => {
      expect(isFitnessContext('Proje Yönetimi')).toBe(false);
      expect(isFitnessContext('Müşteri Faturaları')).toBe(false);
      expect(isFitnessContext(undefined)).toBe(false);
    });
  });

  describe('searchExercises', () => {
    it('boş sorguda liste döner ve limit uygulanır', () => {
      const results = searchExercises('', 5);
      expect(results).toHaveLength(5);
    });

    it('alaka sıralı sonuç döner; ilk sonuç tam eşleşmedir', () => {
      const results = searchExercises('barfiks');
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].id).toBe('pull-ups');
    });

    it('eşleşmeyen sorgu boş liste döner', () => {
      expect(searchExercises('zzzolmayanhareketzzz')).toHaveLength(0);
    });
  });

  describe('generateDynamicExercise', () => {
    it('id öneki dynamic- olan tutarlı bir kayıt üretir', () => {
      const ex = generateDynamicExercise('sumo deadlift');
      expect(ex.id).toBe('dynamic-sumo-deadlift');
      expect(ex.nameTr).toContain('Biyomekanik Form Rehberi');
    });

    it('boş başlıkta varsayılan isim kullanır', () => {
      const ex = generateDynamicExercise('');
      expect(ex.id.startsWith('dynamic-')).toBe(true);
      expect(ex.name).toBe('Genel Egzersiz');
    });
  });

  describe('veri seti bütünlüğü', () => {
    it('hiçbir kayıttaki id dinamik önekle başlamaz', () => {
      expect(EXERCISE_DATABASE.every((ex) => !ex.id.startsWith('dynamic-'))).toBe(true);
    });

    it('id’ler tektir', () => {
      const ids = EXERCISE_DATABASE.map((ex) => ex.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it('her kayıt zorunlu içerik alanlarına sahiptir', () => {
      for (const ex of EXERCISE_DATABASE) {
        expect(ex.name.length, ex.id).toBeGreaterThan(0);
        expect(ex.instructions.length, ex.id).toBeGreaterThanOrEqual(3);
        expect(ex.proTips.length, ex.id).toBeGreaterThan(0);
        expect(ex.commonMistakes.length, ex.id).toBeGreaterThan(0);
        expect(ex.targetMuscles.primary.length, ex.id).toBeGreaterThan(0);
      }
    });
  });
});
