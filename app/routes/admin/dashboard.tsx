import { Header } from 'components'
import React from 'react'

const Dashboard = () => {
  const user = {
    name: "Dipu"
  };
  return (
    <main className='dashboard wrapper'>
      <Header
        title={`Welcome ${user?.name ?? "Guest"}`}
        description="Track activity"
      />
      Dashboard Page contents
    </main>
  )
}

export default Dashboard