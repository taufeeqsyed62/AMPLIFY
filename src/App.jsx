import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import { Line } from 'react-chartjs-2';
import 'react-calendar/dist/Calendar.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css'; // Import the CSS file
import { Container, Row, Col, Form, Button, Navbar, Nav, ListGroup } from 'react-bootstrap'; // Ensure to import Nav and other required components
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register the required components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const App = () => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [scores, setScores] = useState(() => {
    // Load scores from localStorage if they exist
    const savedScores = localStorage.getItem('scores');
    return savedScores ? JSON.parse(savedScores) : {};
  });
  const [inputScore, setInputScore] = useState('');
  const [tasks, setTasks] = useState(() => {
    // Load tasks from localStorage if they exist
    const savedTasks = localStorage.getItem('tasks');
    return savedTasks ? JSON.parse(savedTasks) : {};
  });
  const [taskInput, setTaskInput] = useState('');

  useEffect(() => {
    // Save scores to localStorage whenever they change
    localStorage.setItem('scores', JSON.stringify(scores));
  }, [scores]);

  useEffect(() => {
    // Save tasks to localStorage whenever they change
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  const handleDateClick = (date) => {
    setSelectedDate(date);
  };

  const handleScoreSubmit = (e) => {
    e.preventDefault();
    if (selectedDate && inputScore !== '') {
      const dateStr = selectedDate.toISOString().split('T')[0];
      setScores({ ...scores, [dateStr]: Number(inputScore) });
      setInputScore('');
    }
  };

  const handleTaskAdd = () => {
    if (selectedDate && taskInput.trim() !== '') {
      const dateStr = selectedDate.toISOString().split('T')[0];
      const newTaskList = [...(tasks[dateStr] || []), { task: taskInput.trim(), completed: false }];
      setTasks({ ...tasks, [dateStr]: newTaskList });
      setTaskInput('');
    }
  };

  const handleTaskToggle = (dateStr, index) => {
    const updatedTasks = [...tasks[dateStr]];
    updatedTasks[index].completed = !updatedTasks[index].completed;
    setTasks({ ...tasks, [dateStr]: updatedTasks });
  };

  const getDataForChart = () => {
    const startDate = new Date('2024-07-17');
    const labels = [];
    const data = [];

    // Determine the latest date with a score entry
    let endDate = new Date('2024-07-17');
    Object.keys(scores).forEach((dateStr) => {
      const currentDate = new Date(dateStr);
      if (currentDate > endDate) {
        endDate = currentDate;
      }
    });

    // Generate labels and data for dates between startDate and endDate
    for (let d = startDate; d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      labels.push(dateStr);
      data.push(scores[dateStr] || 0);
    }

    return {
      labels,
      datasets: [
        {
          label: 'Daily Progress',
          data,
          borderColor: 'rgba(75,192,192,1)',
          fill: false,
        },
      ],
    };
  };

  const chartOptions = {
    scales: {
      y: {
        min: 0,
        max: 100,
        ticks: {
          stepSize: 10,
        },
      },
    },
  };

  return (
    <div>
      <Navbar bg="dark" variant="dark" expand="md" className="mb-4">
        <Container>
          <Navbar.Brand href="#home">
            <img
             
            />
            {' AMPLIFY'}
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              {/* Add additional navbar links or components here */}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      <Container className="container">
        <Row>
          <Col md={6}>
            <Calendar
              onClickDay={handleDateClick}
              minDate={new Date('2024-07-17')}
            />
          </Col>
          <Col md={6}>
            {selectedDate && (
              <>
                <Form onSubmit={handleScoreSubmit}>
                  <Form.Group controlId="scoreInput">
                    <Form.Label>Score for {selectedDate.toDateString()}</Form.Label>
                    <Form.Control
                      type="number"
                      value={inputScore}
                      onChange={(e) => setInputScore(e.target.value)}
                      min="0"
                      max="100"
                    />
                  </Form.Group>
                  <Button variant="primary" type="submit" className="mt-2">
                    Submit Score
                  </Button>
                </Form>
                <hr />
                <Form onSubmit={(e) => { e.preventDefault(); handleTaskAdd(); }}>
                  <Form.Group controlId="taskInput">
                    <Form.Label>Daily Tasks</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter task"
                      value={taskInput}
                      onChange={(e) => setTaskInput(e.target.value)}
                    />
                  </Form.Group>
                  <Button variant="primary" type="submit" className="mt-2">
                    Add Task
                  </Button>
                </Form>
              </>
            )}
          </Col>
        </Row>
        {selectedDate && tasks[selectedDate.toISOString().split('T')[0]] && (
          <Row className="mt-4">
            <Col>
              <h5>Tasks for {selectedDate.toDateString()}</h5>
              <ListGroup>
                {tasks[selectedDate.toISOString().split('T')[0]].map((task, index) => (
                  <ListGroup.Item key={index}>
                    <Form.Check
                      inline
                      type="checkbox"
                      label={task.task}
                      checked={task.completed}
                      onChange={() => handleTaskToggle(selectedDate.toISOString().split('T')[0], index)}
                    />
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Col>
          </Row>
        )}
        <Row className="mt-4">
          <Col>
            <div className="chart-container">
              <Line data={getDataForChart()} options={chartOptions} />
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default App;
