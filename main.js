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
const rowsCount = 64

// Size of a 'cell' in the triangle
const defaultSquareSize = 4


const widthOfLine = (lineNumber, squareSize) =>
    (lineNumber + 1) * squareSize

const heightOfTriangle = (linesCount, squareSize) =>
    linesCount * squareSize

const bigInt = (number) => BigInt(Math.floor(number))


const drawTriangleAt = ({ x, y, startingRow = 1, rowsCount, squareSize }) => {
    // Set the fill color of our triangle
    context.fillStyle = 'white'

    // In fact, we can optimize the algorithm by not generating the whole
    // Pascal triangle, but instead just check if numbers are even or odd
    for (let row of pascalTriangle(bigInt(startingRow - 1), bigInt(rowsCount - 1))) {
        // Calculate the most left square coordinate
        let itemX = x - Math.floor(squareSize * row.length / 2)

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
}


let lastUpdateTime = Date.now()
let deltaTime = 0

let topPartSize = 1

const getFPS = () => 1000 / deltaTime

// Function that is called on each frame
const draw = () => {
    deltaTime = Date.now() - lastUpdateTime
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

    // Top triangle
    const topSquareSize = defaultSquareSize * topPartSize
    const topHeight = heightOfTriangle(rowsCount, topSquareSize)
    const topWidth = widthOfLine(rowsCount, topSquareSize)
    const topY = 0
    const topX = 0

    // Bottom part: two triangles
    const bottomSquareSize = defaultSquareSize * (1 - topPartSize)
    const bottomHeight = heightOfTriangle(rowsCount, bottomSquareSize)
    const bottomWidth = widthOfLine(rowsCount, bottomSquareSize)

    // Left triangle
    const leftX = topX - topWidth / 2
    const leftY = topHeight

    // Right triangle
    const rightX = topX + topWidth / 2
    const rightY = leftY

    const y = centerY - (bottomHeight + topHeight) / 2

    context.save()
    context.translate(centerX, y)

    drawTriangleAt({
        x: topX, 
        y: topY, 
        rowsCount,
        squareSize: topSquareSize
    })

    drawTriangleAt({
        x: leftX,
        y: leftY,
        rowsCount,
        squareSize: bottomSquareSize
    })

    drawTriangleAt({
        x: rightX, 
        y: rightY,
        rowsCount,
        squareSize: bottomSquareSize
    })

    // Finish the border around the triangle
    drawTriangleAt({
        x: topX,
        y: leftY + bottomHeight,
        startingRow: rowsCount * 2,
        rowsCount: rowsCount * 2,
        squareSize: defaultSquareSize / 2
    })

    context.restore()

    topPartSize -= Math.min(50, Math.max(10, deltaTime)) / 50 / 10

    if (topPartSize < 0.5) {
        topPartSize = 1
    }

    lastUpdateTime = Date.now()
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

