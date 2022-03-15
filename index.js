const express = require('express')
const morgan = require('morgan')
morgan.token('data', (req, res) => JSON.stringify(req.body))
const server = express()

let persons = [
    { 
      id: 1,
      name: "Arto Hellas", 
      number: "040-123456"
    },
    { 
      id: 2,
      name: "Ada Lovelace", 
      number: "39-44-5323523"
    },
    { 
      id: 3,
      name: "Dan Abramov", 
      number: "12-43-234345"
    },
    { 
      id: 4,
      name: "Mary Poppendieck", 
      number: "39-23-6423122"
    }
]

// Custom logging of the requests
const handleLogging = (tokens, req, res) => {
    return [
        tokens.method(req, res),
        tokens.url(req, res),
        tokens.status(req, res),
        tokens.res(req, res, 'content-length'), '-',
        tokens['response-time'](req, res), 'ms',
        req.method === 'POST' ? tokens['data'](req, res) :null
      ].join(' ')
}

// Auto generation of ID
const generateId = () => {
    const maxId = persons.length > 0
      ? Math.floor(Math.random() * 100000)
      : 0
    return maxId + 1
  }

server.use(express.json())

// Morgan as middleware for terminal logging
server.use(morgan(handleLogging))

// Pages 
server.get('/', (req, res) => {
  res.send('<h1>Hello World!</h1>')
})

server.get('/info', (req, res) => {
    res.send(`<p>Phonebook has info for ${persons.length} people.</p>
             <p>${new Date()}</p>`)
})

// POST
server.post('/api/persons', (request, response) => {
  const body = request.body
  

  if (!body.name || !body.number) {
    return response.status(400).json({ 
      error: 'Name or Number is missing..' 
    })
  }

  if(persons.map(person => person.name).includes(body.name)){
      return response.status(404).json({
          error: `${body.name} already exists in the phonebook..`
      })
  }

  const person = {
    id: generateId(),
    name: body.name || "",
    number: body.number || "",
    date: new Date()
  }

  persons = persons.concat(person)

  response.json(person)
})

// DELETE
server.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    persons = persons.filter(person => person.id !== id)
  
    response.status(204).end()
  })

// GET
server.get('/api/persons', (req, res) => {
  res.json(persons)
})

server.get('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  const person = persons.find(person => person.id === id)

  if (person) {
    response.json(person)
  } else {
    response.status(404).end()
  }
})

const PORT = 3001
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})