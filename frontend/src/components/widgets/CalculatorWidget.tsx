import React, { useState } from 'react'
import { Calculator } from 'lucide-react'

const CalculatorWidget: React.FC = () => {
  const [display, setDisplay] = useState('0')
  const [previousValue, setPreviousValue] = useState<number | null>(null)
  const [operation, setOperation] = useState<string | null>(null)
  const [waitingForNext, setWaitingForNext] = useState(false)

  const inputNumber = (num: string) => {
    if (waitingForNext) {
      setDisplay(num)
      setWaitingForNext(false)
    } else {
      setDisplay(display === '0' ? num : display + num)
    }
  }

  const inputOperation = (nextOperation: string) => {
    const inputValue = parseFloat(display)

    if (previousValue === null) {
      setPreviousValue(inputValue)
    } else if (operation) {
      const currentValue = previousValue || 0
      const newValue = calculate(currentValue, inputValue, operation)

      setDisplay(String(newValue))
      setPreviousValue(newValue)
    }

    setWaitingForNext(true)
    setOperation(nextOperation)
  }

  const calculate = (firstValue: number, secondValue: number, operation: string) => {
    switch (operation) {
      case '+':
        return firstValue + secondValue
      case '-':
        return firstValue - secondValue
      case '*':
        return firstValue * secondValue
      case '/':
        return firstValue / secondValue
      default:
        return secondValue
    }
  }

  const performCalculation = () => {
    const inputValue = parseFloat(display)

    if (previousValue !== null && operation) {
      const newValue = calculate(previousValue, inputValue, operation)
      setDisplay(String(newValue))
      setPreviousValue(null)
      setOperation(null)
      setWaitingForNext(true)
    }
  }

  const clear = () => {
    setDisplay('0')
    setPreviousValue(null)
    setOperation(null)
    setWaitingForNext(false)
  }

  const buttons = [
    ['C', '/', '*', '←'],
    ['7', '8', '9', '-'],
    ['4', '5', '6', '+'],
    ['1', '2', '3', '='],
    ['0', '.', '', '']
  ]

  const handleButtonClick = (value: string) => {
    if (value >= '0' && value <= '9' || value === '.') {
      inputNumber(value)
    } else if (['+', '-', '*', '/'].includes(value)) {
      inputOperation(value)
    } else if (value === '=') {
      performCalculation()
    } else if (value === 'C') {
      clear()
    } else if (value === '←') {
      setDisplay(display.length > 1 ? display.slice(0, -1) : '0')
    }
  }

  return (
    <div className="widget">
      <div className="flex items-center space-x-2 mb-4">
        <Calculator size={20} className="text-neutral-900" />
        <h3 className="font-semibold text-neutral-900">Hesap Makinesi</h3>
      </div>
      
      {/* Display */}
      <div className="bg-neutral-100 p-3 rounded text-right text-lg font-mono mb-3 text-neutral-900">
        {display}
      </div>

      {/* Buttons */}
      <div className="grid grid-cols-4 gap-1">
        {buttons.flat().map((btn, idx) => (
          btn && (
            <button
              key={idx}
              onClick={() => handleButtonClick(btn)}
              className={`p-2 text-sm rounded ${
                ['+', '-', '*', '/', '='].includes(btn)
                  ? 'bg-neutral-900 text-white hover:bg-neutral-800'
                  : btn === 'C' || btn === '←'
                  ? 'bg-neutral-700 text-white hover:bg-neutral-600'
                  : 'bg-neutral-200 text-neutral-900 hover:bg-neutral-300'
              } transition-colors`}
            >
              {btn}
            </button>
          )
        ))}
      </div>
    </div>
  )
}

export default CalculatorWidget