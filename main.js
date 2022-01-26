//
// Copyright (c) 2022 Ivan Teplov
// Licensed under the Apache license 2.0
//

// Get the canvas from the DOM
const canvas = document.querySelector('canvas')
const context = canvas.getContext('2d')

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


// The number of rows in the triangle minus 1
let rowsCount = 128

// Size of a 'cell' in the triangle
let squareSize = 3


// Function that is called on each frame
const draw = () => {
    const { width, height } = canvas
    
    // Fill the background with black
    context.fillStyle = 'black'
    context.strokeStyle = 'transparent'
    context.fillRect(0, 0, width, height)

    // Set the fill color of our triangle
    context.fillStyle = 'white'

    // Coordinates of the center of the screen
    const centerX = width / 2
    const centerY = height / 2

    let y = centerY - squareSize * rowsCount / 2

    // In fact, we can optimize the algorithm by not generating the whole
    // Pascal triangle, but instead just check if numbers are even or odd
    for (let row of pascalTriangle(0n, BigInt(rowsCount - 1))) {
        // Calculate the most left square coordinate
        let itemX = centerX - Math.floor(squareSize * row.length / 2)

        for (let number of row) {
            // If the number in Pascal triangle is odd,
            // then draw the white rectangle
            if (number % 2n === 1n) {
                // (`itemX`, `y`) is the center of rectangle,
                // but canvas uses top left coordinate
                context.fillRect(
                    itemX - squareSize / 2,
                    y - squareSize / 2,
                    squareSize,
                    squareSize
                )
            }

            // Update the X coordinate for the next column
            itemX += squareSize
        }

        // Update the Y coordinate for the next row
        y += squareSize
    }

    requestAnimationFrame(draw)
}

// Make the canvas always match the window size
window.addEventListener('resize', (event) => {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
})

// Trigger the function to resize the canvas
// once the window is loaded
window.addEventListener('load', () => {
    window.dispatchEvent(new Event('resize'))
    draw()
})

