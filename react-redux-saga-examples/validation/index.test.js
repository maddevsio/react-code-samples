import isInt from 'validator/lib/isInt'
import * as v from '.'

test('email', () => {
  expect(v.email('invalid')).toBeTruthy()
  expect(v.email('invalid@invalid')).toBeTruthy()
  expect(v.email('valid@valid.com')).toBeFalsy()
})

test('url', () => {
  expect(v.url('invalid')).toBeTruthy()
  expect(v.url('valid.com')).toBeFalsy()
  expect(v.url('valid.com/test')).toBeFalsy()
  expect(v.url('http://valid.com')).toBeFalsy()
})

test('required', () => {
  expect(v.required('')).toBeTruthy()
  expect(v.required(null)).toBeTruthy()
  expect(v.required(undefined)).toBeTruthy()
  expect(v.required('valid')).toBeFalsy()
})

test('minLength', () => {
  expect(v.minLength(5)('1234')).toBeTruthy()
  expect(v.minLength(5)('12345')).toBeFalsy()
})

test('maxLength', () => {
  expect(v.maxLength(5)('123456')).toBeTruthy()
  expect(v.maxLength(5)('12345')).toBeFalsy()
})

test('integer', () => {
  expect(v.integer('invalid')).toBeTruthy()
  expect(v.integer('2.3')).toBeTruthy()
  expect(v.integer('.5')).toBeTruthy()
  expect(v.integer('1')).toBeFalsy()
})

test('oneOf', () => {
  expect(v.oneOf(['valid', 'test'])('invalid')).toBeTruthy()
  expect(v.oneOf(['valid', 'test'])('valid')).toBeFalsy()
  expect(v.oneOf(['valid', 'test'])('test')).toBeFalsy()
})

test('match', () => {
  expect(v.match('invalid')('123', { password: '321' })).toBeTruthy()
  expect(v.match('password')('123', { password: '321' })).toBeTruthy()
  expect(v.match('password')('321', { password: '321' })).toBeFalsy()
})

test('dependsOfDisountType', () => {
  expect(v.dependsOfDisountType({ 1: v => isInt(v) }, 'typeId')('12', { typeId: 1 })).toBeTruthy()
  expect(v.dependsOfDisountType({ 1: v => isInt(v) }, 'typeId')('12.34', { typeId: 1 })).toBeFalsy()
  expect(v.dependsOfDisountType({})('12.34', { typeId: 1 })).toBeFalsy()
  expect(v.dependsOfDisountType()('12.34', { typeId: 1 })).toBeFalsy()
})

test('isMoreThanTwoDecimals', () => {
  expect(v.isMoreThanTwoDecimals('12.456')).toBeTruthy()
  expect(v.isMoreThanTwoDecimals('12.')).toBeTruthy()
  expect(v.isMoreThanTwoDecimals('12.45')).toBeFalsy()
  expect(v.isMoreThanTwoDecimals('12.4')).toBeFalsy()
  expect(v.isMoreThanTwoDecimals('12')).toBeFalsy()
  expect(v.isMoreThanTwoDecimals('')).toBeFalsy()
  expect(v.isMoreThanTwoDecimals(undefined)).toBeFalsy()
  expect(v.isMoreThanTwoDecimals(null)).toBeFalsy()
})

test('lessOrEqualBalance', () => {
  expect(v.lessOrEqualBalance(100)('12')).toBeFalsy()
  expect(v.lessOrEqualBalance(100)('99')).toBeFalsy()
  expect(v.lessOrEqualBalance(100)('100')).toBeFalsy()
  expect(v.lessOrEqualBalance(100)('101')).toBeTruthy()
})

test('sumDependsOfAmount', () => {
  expect(v.sumDependsOfAmount(0, { receipt: 100, sumDependsOfAmount: [10, 20, 30, 40] })).toBeFalsy()
  expect(v.sumDependsOfAmount(0, { receipt: 100, sumDependsOfAmount: [10, 20, 30, 50] })).toBeFalsy()
  expect(v.sumDependsOfAmount(0, { receipt: 100, sumDependsOfAmount: [10, 20, 30] })).toBeFalsy()
})

test('amountDependsOfSum', () => {
  expect(v.amountDependsOfSum(100)(100)).toBeFalsy()
  expect(v.amountDependsOfSum(100)(99)).toBeTruthy()
  expect(v.amountDependsOfSum(100)(101)).toBeTruthy()
})

test('greaterThan', () => {
  expect(v.greaterThan(0)(1)).toBeFalsy()
  expect(v.greaterThan(0)(0)).toBeTruthy()
  expect(v.greaterThan(0)(-1)).toBeTruthy()
})

test('createValidator', () => {
  const validator = v.createValidator({
    email: [v.required, v.email],
    password: [v.required, v.minLength(6)],
    passwordRepeat: [v.match('password'), v.required],
  })

  expect(typeof validator).toBe('function')

  expect(validator({
    email: '',
    password: '',
    passwordRepeat: null,
  })).toEqual({
    email: v.required(''),
    password: v.required(''),
    passwordRepeat: v.match('a')('c', { a: 'b' }),
  }, 'Expected to follow the validation order')

  expect(Object.keys(validator({
    email: 'invalid',
    password: '12345',
    passwordRepeat: '',
  }))).toEqual(['email', 'password', 'passwordRepeat'])

  expect(Object.keys(validator({
    email: 'test@example.com',
    password: '12345',
    passwordRepeat: '',
  }))).toEqual(['password', 'passwordRepeat'])

  expect(Object.keys(validator({
    email: 'test@example.com',
    password: '123456',
    passwordRepeat: '654321',
  }))).toEqual(['passwordRepeat'])

  expect(validator({
    email: 'test@example.com',
    password: '123456',
    passwordRepeat: '123456',
  })).toEqual({})

  expect(validator()).toEqual({
    email: v.required(''),
    password: v.required(''),
    passwordRepeat: v.required(''),
  })
})
