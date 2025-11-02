import { useState, useEffect } from 'react'
import { SignedIn, useUser } from '@clerk/clerk-react'
import { locationService, categoryService, postService } from '../../lib/database.js'
import CardProduct from '../../components/cardProduct/CardProduct.jsx'
import './HomePage.css'
import banner1 from '../../assets/banner1.png'
import banner2 from '../../assets/banner2.png'
export default function HomePage() {
  return (
    <>
      <img src={banner1} alt="Banner 1" />
      <img src={banner2} alt="Banner 2" />
      <h1>Welcome to the Home Page</h1>
      <CardProduct />
      
    </>
    
  )
}