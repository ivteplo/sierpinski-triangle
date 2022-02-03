//
// Copyright (c) 2022 Ivan Teplov
// Licensed under the Apache license 2.0
//

// Get the canvas from the DOM
const canvas = document.querySelector('canvas')
const context = canvas.getContext('2d')

// The number of rows in the triangle minus 1
const rowsCount = 64

// Size of a 'cell' in the triangle
const defaultSquareSize = 4

const widthOfLine = (lineNumber, squareSize) =>
    (lineNumber + 1) * squareSize

const heightOfTriangle = (linesCount, squareSize) =>
    linesCount * squareSize

const drawTriangleAt = ({ x, y, startingRow = 1, rowsCount, squareSize }) => {
    startingRow = bigInt(startingRow - 1)
    const endingRow = bigInt(rowsCount - 1)
    const triangle = sierpinskiTriangle(startingRow, endingRow)

    // In fact, we can optimize the algorithm by not generating the whole
    // Pascal triangle, but instead just check if numbers are even or odd
    for (let row of triangle) {
        // Calculate the most left square coordinate
        let itemX = x - Math.floor(squareSize * row.length / 2)

        for (const theCellIsFilled of row) {
            if (theCellIsFilled) {
                // (`itemX`, `y`) is the center of rectangle,
                // but canvas uses top left coordinate of the rectangle
                context.fillRect(
                    itemX - squareSize / 2,
                    y - squareSize / 2,
                    squareSize,
                    squareSize
                )
            }

            // Update the X coordinate for the next cell
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

    // Set the fill color of our triangles
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
