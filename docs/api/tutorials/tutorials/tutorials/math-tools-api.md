---
title: Math Tools API
group: Math Tools
---

# Math Tools API Reference

## Contents

- [round](#round)
- [range](#range)
- [randSign](#randsign)
- [randBool](#randbool)
- [randInt](#randint)
- [rand](#rand)
- [randElement](#randelement)
- [removeRandElement](#removerandelement)
- [randElements](#randelements)

---

## round

Rounds a number or numbers in an array
@method
@param {number | Array<number>} arrayOrValue - Value or array of values to be rounded
@param {number} precision - Number of decimal places to round to
@returns {number | Array<number>} Rounded value or array of values

---

## range

Creates an array with a range of numbers
@param start - Range start
@param stop - Range stop
@param step - Range step
@returns {Array<number>} Range of numbers in an array

---

## randSign

Return a -1 or 1 randomly
@return {number} -1 or 1

---

## randBool

Return a true or false randomly
@return {boolean}

---

## randInt

Return a random int.

If a `max = null`, then the returned integer will be in the range of 0 to
`minOrMax`.

Otherwise the returned value is in the range of `minOrMax` to `max`.

Use `sign` to also return a random sign (negative or positive);

@return {number} random integer

---

## rand

Return a random number.

If a `max = null`, then the returned number will be in the range of 0 to
`minOrMax`.

Otherwise the returned value is in the range of `minOrMax` to `max`.

Use `sign` to also return a random sign (negative or positive);

@return {number} random number

---

## randElement

Get a random element from an array.

---

## removeRandElement

Remove and return random element from an array.

---

## randElements

Get a number of random elements from an array.

---

