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

### Parameters

<ul class="tsd-parameter-list">
<li><span><span class="tsd-kind-parameter">arrayOrValue</span>: <span class="tsd-signature-type"><a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number" class="tsd-signature-type">number</a> | <a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array" class="tsd-signature-type">Array</a><<a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number" class="tsd-signature-type">number</a>></span></span><div class="tsd-comment tsd-typography"><p>Value or array of values to be rounded</p></div></li>
<li><span><span class="tsd-kind-parameter">precision</span>: <span class="tsd-signature-type"><a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number" class="tsd-signature-type">number</a></span></span><div class="tsd-comment tsd-typography"><p>Number of decimal places to round to</p></div></li>
</ul>

### Returns

<span class="tsd-signature-type"><a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number" class="tsd-signature-type">number</a> | <a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array" class="tsd-signature-type">Array</a><<a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number" class="tsd-signature-type">number</a>></span> — Rounded value or array of values

---

## range

Creates an array with a range of numbers

### Parameters

<ul class="tsd-parameter-list">
<li><span><span class="tsd-kind-parameter">start</span></span><div class="tsd-comment tsd-typography"><p>Range start</p></div></li>
<li><span><span class="tsd-kind-parameter">stop</span></span><div class="tsd-comment tsd-typography"><p>Range stop</p></div></li>
<li><span><span class="tsd-kind-parameter">step</span></span><div class="tsd-comment tsd-typography"><p>Range step</p></div></li>
</ul>

### Returns

<span class="tsd-signature-type"><a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array" class="tsd-signature-type">Array</a><<a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number" class="tsd-signature-type">number</a>></span> — Range of numbers in an array

---

## randSign

Return a -1 or 1 randomly

### Returns

<span class="tsd-signature-type"><a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number" class="tsd-signature-type">number</a></span> — -1 or 1

---

## randBool

Return a true or false randomly

### Returns

<span class="tsd-signature-type"><a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean" class="tsd-signature-type">boolean</a></span>

---

## randInt

Return a random int.

If a `max = null`, then the returned integer will be in the range of 0 to
`minOrMax`.

Otherwise the returned value is in the range of `minOrMax` to `max`.

Use `sign` to also return a random sign (negative or positive);

### Parameters

<ul class="tsd-parameter-list">
<li><span><span class="tsd-kind-parameter">minOrMax</span>: <span class="tsd-signature-type"><a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number" class="tsd-signature-type">number</a></span></span></li>
<li><span><span class="tsd-kind-parameter">max</span>: <span class="tsd-signature-type"><a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number" class="tsd-signature-type">number</a> | null</span> <span class="tsd-signature-symbol">= null</span></span></li>
<li><span><span class="tsd-kind-parameter">sign</span>: <span class="tsd-signature-type"><a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean" class="tsd-signature-type">boolean</a></span> <span class="tsd-signature-symbol">= false</span></span></li>
</ul>

### Returns

<span class="tsd-signature-type"><a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number" class="tsd-signature-type">number</a></span> — random integer

---

## rand

Return a random number.

If a `max = null`, then the returned number will be in the range of 0 to
`minOrMax`.

Otherwise the returned value is in the range of `minOrMax` to `max`.

Use `sign` to also return a random sign (negative or positive);

### Parameters

<ul class="tsd-parameter-list">
<li><span><span class="tsd-kind-parameter">minOrMax</span>: <span class="tsd-signature-type"><a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number" class="tsd-signature-type">number</a></span></span></li>
<li><span><span class="tsd-kind-parameter">max</span>: <span class="tsd-signature-type"><a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number" class="tsd-signature-type">number</a> | null</span> <span class="tsd-signature-symbol">= null</span></span></li>
<li><span><span class="tsd-kind-parameter">plusOrMinus</span>: <span class="tsd-signature-type"><a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean" class="tsd-signature-type">boolean</a></span> <span class="tsd-signature-symbol">= false</span></span></li>
</ul>

### Returns

<span class="tsd-signature-type"><a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number" class="tsd-signature-type">number</a></span> — random number

---

## randElement

Get a random element from an array.

### Parameters

<ul class="tsd-parameter-list">
<li><span><span class="tsd-kind-parameter">inputArray</span>: <span class="tsd-signature-type"><a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array" class="tsd-signature-type">Array</a><T></span></span></li>
</ul>

### Returns

<span class="tsd-signature-type">T</span>

---

## removeRandElement

Remove and return random element from an array.

### Parameters

<ul class="tsd-parameter-list">
<li><span><span class="tsd-kind-parameter">inputArray</span>: <span class="tsd-signature-type"><a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array" class="tsd-signature-type">Array</a><T></span></span></li>
</ul>

### Returns

<span class="tsd-signature-type">T</span>

---

## randElements

Get a number of random elements from an array.

### Parameters

<ul class="tsd-parameter-list">
<li><span><span class="tsd-kind-parameter">num</span>: <span class="tsd-signature-type"><a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number" class="tsd-signature-type">number</a></span></span></li>
<li><span><span class="tsd-kind-parameter">inputArray</span>: <span class="tsd-signature-type"><a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array" class="tsd-signature-type">Array</a><T></span></span></li>
</ul>

### Returns

<span class="tsd-signature-type"><a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array" class="tsd-signature-type">Array</a><T></span>

---

