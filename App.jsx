// src/App.jsx
import { useState } from 'react'

function App() {
  const [formData, setFormData] = useState({
    picture: null,
    foodType: '',
    description: '',
    location: '',
    expiredTime: ''
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    setFormData({ ...formData, picture: file })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Create the data to send
    const submitData = {
      picture: formData.picture,
      foodType: formData.foodType,
      description: formData.description,
      location: formData.location,
      createTime: new Date().toISOString(), // Current time
      expiredTime: new Date(formData.expiredTime).toISOString()
    }

    console.log('Form submitted:', submitData)
    alert('Food uploaded! (Check console for data)')
    
    // TODO: Your backend teammate will give you an API endpoint
    // You'll send submitData to that endpoint here
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold text-center mb-6 text-green-600">
          Share Your Leftover Food
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Picture Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Food Picture *
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              required
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-green-50 file:text-green-700
                hover:file:bg-green-100"
            />
          </div>

          {/* Food Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Food Type *
            </label>
            <input
              type="text"
              name="foodType"
              value={formData.foodType}
              onChange={handleInputChange}
              placeholder="e.g., Ramen, Bento, Pizza"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Tell us about the food..."
              required
              rows="4"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pickup Location *
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              placeholder="Enter your address"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <p className="text-sm text-gray-500 mt-1">
              (Your teammate will replace this with a map picker)
            </p>
          </div>

          {/* Expiration Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Expiration Date & Time *
            </label>
            <input
              type="datetime-local"
              name="expiredTime"
              value={formData.expiredTime}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-green-600 text-white py-3 px-4 rounded-md font-semibold hover:bg-green-700 transition duration-200"
          >
            Share Food
          </button>
        </form>
      </div>
    </div>
  )
}

export default App