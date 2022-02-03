//
// Copyright (c) 2022 Ivan Teplov
// Licensed under the Apache license 2.0
//

// Helper function to make the code cleaner.
// It creates an iterator for integers in range [from; to]
function* range (from, to) {
    for (let i = from; i <= to; ++i) {
        yield i
    }
}

// Find production of all items in an array/iterator
const multiply = (array, base = 1n) => {
    let result = base
    
    for (let item of array)
        result *= item

    return result
}

// Find a factorial of a number
const factorial = (ofNumber) => multiply(range(2n, ofNumber))

// Function from combinatorics
const combination = (from, of_) =>
    // We do this comparison in order to optimize the code
    // and allow combinations of a bit bigger values to be used
    of_ > from - of_
        ? multiply(range(of_ + 1n, from)) / factorial(from - of_)
        : multiply(range(from - of_ + 1n, from)) / factorial(of_)

// Function that generates a Pascal triangle
function* pascalTriangle (from, to) {
    for (let power of range(from, to)) {
        // Generate coefficients using Newton's binomial
        const coefficients = Array.from(
            range(0n, power),
            // Almost the same as using `#map()`, but 
            // better for performance
            (index) => combination(power, index)
        )
        
        // Return the row of coefficients
        yield coefficients
    }
}

function* sierpinskiTriangle (from, to) {
    for (const row of pascalTriangle(from, to)) {
        yield row.map(item => item % 2n === 1n)
    }
}

const bigInt = (number) => BigInt(Math.floor(number))
