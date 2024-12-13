// App.tsx
import ProjectSearch from './components/ProjectSearch/ProjectSearch'

function App() {
  return (
    // Removed the centering flex to allow full layout with sidebar
    <div className="w-screen h-screen bg-gradient-to-b from-gray-900 via-black to-gray-900 text-white">
      <ProjectSearch />
    </div>
  )
}

export default App
