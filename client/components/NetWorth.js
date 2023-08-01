import React, { useEffect, useState } from 'react'
import Balance from './Balance'

const NetWorth = props => {
  const { completed, amount } = props

  const containerStyles = {
    height: 20,
    width: '100%',
    backgroundColor: '#e0e0de',
    borderRadius: 20,
    margin: 20
  }

  const fillerStyles = {
    height: '100%',
    width: `${completed}%`,
    backgroundColor: '#85bb65',
    borderRadius: 'inherit',
    textAlign: 'right'
  }

  const labelStyles = {
    padding: 5,
    color: 'white',
    fontWeight: 'bold'
  }

  return (
    <div style={containerStyles}>
      <div style={fillerStyles}>
        <span style={labelStyles}> {`${completed}%`}</span>
      </div>
      <span> {`${amount}`}</span>
    </div>
  )
}

export default NetWorth
