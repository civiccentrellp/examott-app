"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import {
  Navbar,
  Nav,
  Container,
  Button,
  Offcanvas,
  Form,
  InputGroup,
  NavDropdown,
  Carousel,
  Row,
  Col,
  Card,
  Modal,
} from "react-bootstrap";
import { CaretRightFill, Search, Broadcast, ShopWindow, Clipboard2CheckFill, TelephoneInboundFill, Arrows, Calendar2Event, Dot, Youtube, Instagram, Facebook, Twitter, Whatsapp, Telegram, ChevronDown, ChevronUp } from "react-bootstrap-icons";
import Link from "next/link";
import { useRouter } from "next/navigation";



export default function LandingPage() {
  const router = useRouter();
  const [showSearch, setShowSearch] = useState(false);
  const [activeSubMenu, setActiveSubMenu] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [show, setShow] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // You can send form data to backend or show toast here
    setShowModal(false);
  };


  const menuItems = [
    {
      name: "UPSC",
      href: "#",
      subMenu: [
        { name: "Prelims", href: "#upsc-prelims" },
        { name: "Mains", href: "#upsc-mains" },
        { name: "Interview", href: "#upsc-interview" }
      ]
    },
    {
      name: "TGPSC",
      href: "#",
      subMenu: [
        { name: "Group 1", href: "#tgpsc-group1" },
        { name: "Group 2", href: "#tgpsc-group2" }
      ]
    },
    {
      name: "APPSC",
      href: "#",
      subMenu: [
        { name: "Executive", href: "#appsc-executive" },
        { name: "Non-Executive", href: "#appsc-nonexecutive" },
        { name: "Assistant", href: "#appsc-assistant" }
      ]
    }
  ];

  return (
    <div className="min-vh-100 text-dark">

      <style jsx>{`
  @media (min-width: 768px) {
    .d-md-border-none {
      border-bottom: none !important;
    }
  }
`}</style>

      {/* Responsive Offcanvas Navbar */}
      <>
        {["lg"].map((expand) => (
          <Navbar
            key={expand}
            expand={expand}
            bg="white"
            fixed="top"
            className="shadow-sm py-3 px-4"
          >
            <Container fluid>
              <div className="w-100 d-flex justify-content-center gap-4 align-items-center">
                {/* Left: Logo */}
                <Navbar.Brand href="/">
                  {/* <img
                    src="/assets/logo.png"
                    alt="ExamOTT Logo"
                    style={{ height: "50px" }}
                  /> */}
                  <h1 className="fw-bold fs-2">ExamOTT</h1>
                </Navbar.Brand>

                <div className="d-flex align-items-center gap-4">
                  <Navbar.Toggle
                    aria-controls={`offcanvasNavbar-expand-${expand}`}
                  />
                  <Navbar.Offcanvas
                    id={`offcanvasNavbar-expand-${expand}`}
                    aria-labelledby={`offcanvasNavbarLabel-expand-${expand}`}
                    placement="end"
                  >
                    <Offcanvas.Header closeButton>
                      <Offcanvas.Title id={`offcanvasNavbarLabel-expand-${expand}`}>
                        Menu
                      </Offcanvas.Title>
                    </Offcanvas.Header>
                    <Offcanvas.Body>
                      <Nav className="flex-grow-1 pe-3 gap-4 align-items-lg-center">
                        {/* Main Dropdown */}
                        <NavDropdown title="All Exams" id="nav-dropdown">
                          {menuItems.map((item) => (
                            <div
                              key={item.name}
                              className="position-relative w-100"
                              onMouseEnter={() => setActiveSubMenu(item.name)}
                              onMouseLeave={() => setActiveSubMenu(null)}
                              style={{ position: "relative" }}
                            >
                              <NavDropdown.Item href={item.href} style={{ width: "100%" }}>
                                {item.name}
                              </NavDropdown.Item>

                              {/* Submenu (Only Show if Exists) */}
                              {activeSubMenu === item.name && item.subMenu.length > 0 && (
                                <div
                                  className="shadow rounded bg-white"
                                  style={{
                                    position: "absolute",
                                    left: "100%",
                                    top: "0",
                                    width: "180px",
                                    display: "flex",
                                    flexDirection: "column",
                                    zIndex: 1000,
                                    border: "1px solid #ddd",
                                    padding: "10px",
                                    backgroundColor: "white",
                                  }}
                                >
                                  {item.subMenu.map((subItem) => (
                                    <NavDropdown.Item key={subItem.name} href={subItem.href}>
                                      {subItem.name}
                                    </NavDropdown.Item>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </NavDropdown>

                        <Nav.Link href="https://classplusapp.com/diy/free-material/addContent/test">Free Tests</Nav.Link>
                        <Nav.Link href="#courses">Current Affairs</Nav.Link>
                        <Nav.Link href="#batches">Study Materials</Nav.Link>
                        <NavDropdown
                          title="More"
                          id={`offcanvasNavbarDropdown-expand-${expand}`}
                        >
                          <NavDropdown.Item href="#action3">Action</NavDropdown.Item>
                          <NavDropdown.Item href="#action4">
                            Another action
                          </NavDropdown.Item>
                          <NavDropdown.Item href="#action5">
                            Something else here
                          </NavDropdown.Item>
                        </NavDropdown>


                        <NavDropdown
                          title="Contact US"
                          id={`offcanvasNavbarDropdown-expand-${expand}`}
                        >
                          <NavDropdown.Item href="#action3">70134 95019</NavDropdown.Item>
                        </NavDropdown>


                        <div className="d-flex align-items-center position-relative">
                          <motion.div
                            initial={{ width: "40px", padding: "0px" }}
                            animate={{
                              width: showSearch ? "250px" : "40px",
                              padding: showSearch ? "0px 12px" : "0px",
                            }}
                            transition={{ duration: 0.1 }}
                            className="bg-white border border-dark rounded-4 d-flex align-items-center overflow-hidden shadow-sm"
                            style={{
                              height: "40px",
                              position: "relative",
                              transition: "all 0.1s ease-in-out",
                            }}
                          >
                            {/* Search Icon (inside search bar) */}
                            <Button
                              variant="outline-dark"
                              className="border-0 px-2 d-flex align-items-center justify-content-center"
                              onClick={() => setShowSearch(!showSearch)}
                              style={{
                                zIndex: 2,
                                background: "transparent",
                                height: "40px",
                                width: "40px",

                              }}
                            >
                              <Search size={20} color="black" />
                            </Button>

                            {/* Sliding Search Input */}
                            <motion.div
                              initial={{ width: 0, opacity: 0 }}
                              animate={{ width: showSearch ? "200px" : 0, opacity: showSearch ? 1 : 0 }}
                              transition={{ duration: 0.3 }}
                              className="overflow-hidden"
                            >
                              <Form className="d-flex w-100">
                                <InputGroup>
                                  <Form.Control
                                    type="search"
                                    placeholder="Search..."
                                    aria-label="Search"
                                    className="border-0 bg-transparent"
                                    style={{
                                      outline: "none",
                                      boxShadow: "none",
                                      height: "38px",
                                      fontSize: "14px",
                                      paddingLeft: "8px",
                                    }}
                                  />
                                </InputGroup>
                              </Form>
                            </motion.div>
                          </motion.div>
                        </div>

                        <Button
                          variant="dark"
                          className="ms-2 mt-3 mt-lg-0 px-4"
                          // onClick={() => {
                          //   window.location.href = 'https://elearn.civiccentre.in/learn/account/signin';
                          // }}
                          onClick={() => router.push("/sign-in")}
                        >
                          Login/Register
                        </Button>


                      </Nav>
                    </Offcanvas.Body>
                  </Navbar.Offcanvas>
                </div>
              </div>
            </Container>
          </Navbar>

        ))}
      </>

      {/* Banner Carousel Section */}
      <section className="pt-5 mt-5" >
        <Carousel style={{ height: "35vh" }}>
          {[1, 4, 3].map((num) => (
            <Carousel.Item key={num}>
              <motion.img
                className="d-block w-100 rounded"
                src={`assets/banner${num}.jpg`}
                alt={`Slide ${num}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1 }}
                style={{ height: "35vh" }}
              />
            </Carousel.Item>
          ))}
        </Carousel>
      </section>
      {/* Hero Section */}
      <div style={{ backgroundColor: "white" }}>
        <div className=" d-flex w-100 py-5" style={{ backgroundColor: "#f8f9fa", height: '400px' }}>
          <div className="container d-flex flex-column flex-lg-row align-items-center justify-content-between gap-5">

            {/* Text Section */}
            <div className="text-center text-lg-start">
              <h2
                className="fw-bold mb-4"
                style={{
                  fontSize: "2.5rem",
                  lineHeight: "1.3",
                  color: "#212529",
                }}
              >
                ONE CENTRE <br />
                FOR ALL <span style={{ color: "#6c757d" }}>COMPETITIVE EXAMS</span>
              </h2>
              <Button
                className="px-4 py-2 mt-2"
                style={{
                  backgroundColor: "#000",
                  color: "#fff",
                  borderRadius: "30px",
                  fontWeight: "500",
                  transition: "all 0.3s ease-in-out",
                }}
                onMouseOver={(e) => {
                  const target = e.target as HTMLButtonElement;
                  target.style.backgroundColor = "#333";
                }}
                onMouseOut={(e) => {
                  const target = e.target as HTMLButtonElement;
                  target.style.backgroundColor = "#000";
                }}
                onClick={() => {
                  window.location.href = 'https://elearn.civiccentre.in/learn/account/signin';
                }}
              >
                Get Started
              </Button>
            </div>

            {/* Image Section */}
            <div
              className="p-3 bg-white rounded-4 shadow"
              style={{
                maxWidth: "300px",
                width: "100%",
                textAlign: "center",
              }}
            >
              <img
                src="/assets/logo.png"
                alt="ExamOTT Logo"
                className="img-fluid rounded-4"
                style={{ objectFit: "contain" }}
              />
            </div>
          </div>
        </div>

        <div
          className="position-relative mx-auto bg-white rounded-4 shadow px-3"
          style={{
            width: "90%",
            marginTop: "-30px",
            zIndex: 10,
            padding: "30px 0",
          }}
        >
          <div className="row row-cols-2 row-cols-md-4 text-center gx-0 gy-4">
            {/* Item 1 */}
            <div className="col d-flex flex-column align-items-center gap-2 pb-3 pb-md-0 border-bottom d-md-border-none cursor-pointer"
              style={{ borderRight: "1px solid #dee2e6" }}
              onClick={() => {
                window.location.href = "https://elearn.civiccentre.in/learn/account/signin";
              }}
            >
              <div className="bg-light rounded-circle p-3 mb-2">
                <Broadcast size={28} color="black" />
              </div>
              <h6 className="fw-bold mb-0">Live Classes</h6>
            </div>

            {/* Item 2 */}
            <div className="col d-flex flex-column align-items-center gap-2 pb-3 pb-md-0 border-bottom d-md-border-none cursor-pointer"
              style={{ borderRight: "1px solid #dee2e6" }}
              onClick={() => {
                window.location.href = 'https://store.civiccentre.in/';
              }}
            >
              <div className="bg-light rounded-circle p-3 mb-2"
                onClick={() => {
                  window.location.href = 'https://store.civiccentre.in/';
                }}
              >
                <ShopWindow size={28} color="black" />
              </div>
              <h6 className="fw-bold mb-0">Store</h6>
            </div>

            {/* Item 3 */}
            <div className="col d-flex flex-column align-items-center gap-2 pb-0 cursor-pointer"
              style={{ borderRight: "1px solid #dee2e6" }}
              onClick={() => {
                window.location.href = "https://elearn.civiccentre.in/learn/account/signin";
              }}
            >
              <div className="bg-light rounded-circle p-3 mb-2">
                <Clipboard2CheckFill size={28} color="black" />
              </div>
              <h6 className="fw-bold mb-0">Free Tests</h6>
            </div>

            {/* Item 4 */}
            <div
              className="col d-flex flex-column align-items-center gap-2 pb-0 cursor-pointer"
              onClick={() => setShowModal(true)}
            >
              <div className="bg-light rounded-circle p-3 mb-2">
                <TelephoneInboundFill size={28} color="black" />
              </div>
              <h6 className="fw-bold mb-0">Request Call</h6>
            </div>

            {/* Modal Form */}
            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
              <Modal.Header closeButton>
                <Modal.Title>Request a Callback</Modal.Title>
              </Modal.Header>
              <Form onSubmit={handleSubmit}>
                <Modal.Body>
                  <Form.Group className="mb-3" controlId="formName">
                    <Form.Label>Name</Form.Label>
                    <Form.Control type="text" placeholder="Enter your name" required />
                  </Form.Group>

                  <Form.Group className="mb-3" controlId="formEmail">
                    <Form.Label>Email</Form.Label>
                    <Form.Control type="email" placeholder="Enter your email" required />
                  </Form.Group>

                  <Form.Group className="mb-3" controlId="formMobile">
                    <Form.Label>Mobile Number</Form.Label>
                    <Form.Control type="tel" placeholder="Enter mobile number" required />
                  </Form.Group>

                  <Form.Group className="mb-3" controlId="formStudentType">
                    <Form.Label>Are you a Civic Centre student?</Form.Label>
                    <Form.Select required>
                      <option value="">Select</option>
                      <option value="new">New Student</option>
                      <option value="civic">Civic Centre Student</option>
                    </Form.Select>
                  </Form.Group>

                  <Form.Group className="mb-3" controlId="formEnquiry">
                    <Form.Label>Enquiry</Form.Label>
                    <Form.Control as="textarea" rows={3} placeholder="What would you like to know?" />
                  </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                  <Button variant="secondary" onClick={() => setShowModal(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="dark">
                    Submit Request
                  </Button>
                </Modal.Footer>
              </Form>
            </Modal>

          </div>
        </div>


      </div>

      {/* Download App Section */}
      <section className="bg-white py-5 d-flex justify-content-center">
        <div className=" bg-light text-center p-8 rounded-2 m-4 shadow"
          style={{
            width: "80%",
            marginTop: "-50px",
            zIndex: 10,
            padding: "30px 0",
          }}>
          <h3 className="fw-bold fs-3 text-dark mb-4">
            Join India's Best Knowledge Bank for All Competitive Exams
          </h3>

          <div className="steps-container d-flex justify-content-center align-items-center gap-3 flex-wrap mb-4">
            <p className="text-dark m-0">Start</p>
            <Arrows size={20} color="black" />
            <p className="text-danger m-0">Plan</p>
            <Arrows size={20} color="black" />
            <p className="text-warning m-0">Prepare</p>
            <Arrows size={20} color="black" />
            <p className="text-success m-0">Progress</p>
            <Arrows size={20} color="black" />
            <p className="text-primary m-0">Success</p>
          </div>

          <div>
            <div className="fw-bold fs-5 mb-3">Download our Apps</div>
            <div className="d-flex justify-content-center gap-4 flex-wrap">
              <a
                href="https://play.google.com/store/apps/details?id=co.rogers.itphd"
                target="_blank"
                rel="noopener noreferrer"
                className="text-decoration-none text-dark"
              >
                <div className="d-flex border p-3 rounded shadow-sm bg-light gap-4 align-items-center">
                  <div>
                    <img src="/assets/playstore.png" alt="Google Play" />
                  </div>
                  <span>
                    Download on The <br />
                    <strong>Google Play</strong>
                  </span>
                </div>
              </a>

              <a
                href="https://apps.apple.com/in/app/myinstitute/id1472483563"
                target="_blank"
                rel="noopener noreferrer"
                className="text-decoration-none text-dark"
              >
                <div className="d-flex border p-3 rounded shadow-sm bg-light gap-4 align-items-center">
                  <div>
                    <img src="/assets/apple.png" alt="App Store" />
                  </div>
                  <span>
                    Download on The <br />
                    <strong>App Store</strong>
                  </span>
                </div>
              </a>
            </div>
          </div>

        </div>
      </section>

      {/* Categories Section */}
      <section className="bg-white py-5">
        <div className="container">
          <h2 className="fw-bold text-center mb-5">Categories</h2>

          <div className="row g-4 justify-content-center">
            {/* Category Card */}
            {[
              { title: "Popular Courses" },
              { title: "UPSC" },
              { title: "TGPSC" },
              { title: "APPSC" },
            ].map((category, index) => (
              <div className="col-12 col-md-6 col-lg-6 col-xl-6" key={index}>
                <Card className="shadow p-3 h-100">
                  <Card.Title className="fs-4 fw-bold mb-3">{category.title}</Card.Title>

                  <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3 px-2">
                    <Card.Img
                      src="/assets/logo.png"
                      alt={`${category.title} Logo`}
                      style={{ width: "250px", height: "200px", objectFit: "contain" }}
                    />

                    <div className="w-100 d-flex flex-column gap-2 align-items-center justify-content-center">
                      <Button className="bg-light text-dark rounded-3 w-100 border-dark">Group-1</Button>
                      <Button className="bg-light text-dark rounded-3 w-100 border-dark">Group-2</Button>
                      <Button className="bg-light text-dark rounded-3 w-100 border-dark">Group-3</Button>
                      <Button className="bg-light text-dark rounded-3 w-100 border-dark">Group-4</Button>
                    </div>
                  </div>

                  <Card.Body className="d-flex flex-column flex-md-row justify-content-center align-items-center gap-3 mt-4">
                    <Button variant="dark" className="w-100 p-2">Explore All</Button>
                    <Button variant="light" className="w-100 border-dark">Talk with our Expert</Button>
                  </Card.Body>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Location Section */}
      <section className="bg-white mt-4 py-5">
        <div className="text-center w-100 bg-light p-5">
          <h2 className="fw-bold mb-3 fs-2">
            Explore <span className="text-success">CivicCentre IAS</span> Offline Centre’s
          </h2>
          <h3 className="mb-4 fw-bold">
            Build Your Dream Future With Our Learning Experience
          </h3>
          <div className="d-flex flex-column bg-white p-4 rounded-2 shadow-sm">
            <h5 className="text-center py-4 fw-bold">
              Find Offline Centre's In Your Nearest Location
            </h5>
            <div className="d-flex justify-content-center flex-wrap gap-4 py-4">
              {[
                { name: "Vizag", image: "/assets/vizag.jpeg" },
                { name: "Nalgonda", image: "/assets/vizag.jpeg" },
                { name: "Chikkadipally", image: "/assets/vizag.jpeg" },
                { name: "Manjeera Class rooms", image: "/assets/vizag.jpeg" },
                { name: "Indus Bhavan", image: "/assets/vizag.jpeg" },
              ].map((location, index) => (
                <div
                  key={index}
                  className="border p-3 rounded bg-light text-dark d-flex align-items-center gap-3 "
                  style={{ width: '300px' }}
                >
                  <Image
                    src={location.image}
                    alt={location.name}
                    width={100}
                    height={100}
                    className="rounded object-fit-cover"
                  />
                  <div className="fw-semibold fs-6 text-start">{location.name}</div>
                </div>
              ))}
            </div>
            <Button variant="dark" className="mx-auto mt-3 w-auto">
              View All Offline Centre’s
            </Button>
          </div>
        </div>
      </section>

      {/* Newly Launched Courses Section */}
      <section className="bg-white py-5 px-6">
        <h2 className="fw-bold fs-3 text-center mb-4">Newly Launched Courses</h2>
        <div className="d-flex gap-4 px-3 scroll-container">
          {[...Array(4)].map((_, idx) => (
            <Card key={idx} className="shadow p-4 flex-shrink-0 scroll-item" style={{ width: '100%', maxWidth: '30rem' }}>
              <div className="d-flex justify-content-center p-3">
                <Card.Img src="/assets/logo.png" style={{ width: '100%', maxWidth: '250px', height: '200px', objectFit: 'contain' }} />
              </div>
              <Card.Title className="text-center fs-6 fw-semibold">TGPSC Group-2 2024 Prelims Cum Mains Classes 2024-2025</Card.Title>
              <div className="d-flex flex-column mt-3 gap-2">
                <span className="d-flex align-items-center gap-2"><Calendar2Event /> <p className="m-0">Starts 28-Jan-2025</p></span>
                <span className="d-flex align-items-center gap-2"><Clipboard2CheckFill /> <p className="m-0">120 Tests, 3360 Questions</p></span>
                <span className="d-flex align-items-center gap-2"><Dot size={20} /> <p className="m-0">Online | Offline</p></span>
                <span className="d-flex align-items-center gap-2"><Dot size={20} /> <p className="m-0">English | Telugu</p></span>
                <span className="d-flex align-items-center gap-2"><Dot size={20} /> <p className="m-0">₹4500 | ₹4000</p></span>
              </div>
              <Card.Body className="d-flex gap-3 mt-3">
                <Button variant="dark" className="w-100">Explore</Button>
                <Button variant="light" className="w-100 border-dark">Buy Now</Button>
              </Card.Body>
            </Card>
          ))}
        </div>
      </section>


      {/* Study Materials Section */}
      <section className="p-5 bg-light mt-4">
        <h1 className="fw-bold fs-3">Our <strong>Study Materials</strong></h1>
        <div className="d-flex flex-wrap align-items-center gap-2 p-4">
          <Button className="bg-dark border-none">Popular</Button>
          <Button className="bg-dark border-none">Free</Button>
          <Button className="bg-dark border-none">TGPSC</Button>
          <Button className="bg-dark border-none">APPSC</Button>
          <Button className="bg-dark border-none">UPSC</Button>
          <Button className="bg-dark border-none">TELUGU</Button>
          <Button className="bg-dark border-none">ENGLISH</Button>
        </div>
        <div className="scroll-container d-flex gap-4 px-3 py-3">
          {[...Array(4)].map((_, idx) => (
            <Card key={idx} className="shadow p-4 flex-shrink-0 scroll-item" style={{ width: '100%', maxWidth: '22rem' }}>
              <div className="d-flex justify-content-center p-3">
                <Card.Img src="/assets/logo.png" style={{ width: '100%', maxWidth: '250px', height: '200px', objectFit: 'contain' }} />
              </div>
              <Card.Title className="text-center fs-6 fw-semibold">TGPSC Group-2 2024 Prelims Cum Mains Classes 2024-2025</Card.Title>
            </Card>
          ))}
        </div>

      </section>

      {/* Current Affairs Section */}
      <section className="p-5 bg-light mt-4">
        <h1 className="fw-bold fs-3 text-center"><strong>Current Affairs</strong></h1>

        <div className="d-flex align-items-center justify-content-center gap-5 p-4">
          <Button className="bg-dark border-none">Daily</Button>
          <Button className="bg-dark border-none">Monthly</Button>
          <Button className="bg-dark border-none">Yearly</Button>
        </div>

        <div className="scroll-container d-flex gap-4 px-3">
          {[...Array(7)].map((_, idx) => (
            <Card key={idx} className="shadow p-4 flex-shrink-0 scroll-item" style={{ width: '100%', maxWidth: '22rem' }}>
              <div className="d-flex justify-content-center p-3">
                <Card.Img src="/assets/logo.png" style={{ width: '100%', maxWidth: '250px', height: '200px', objectFit: 'contain' }} />
              </div>
              <Card.Title className="text-center fs-6 fw-semibold">TGPSC Group-2 2024 Prelims Cum Mains Classes 2024-2025</Card.Title>
            </Card>
          ))}
        </div>

      </section>

      {/* Reflection Section */}
      <section className="d-flex flex-col flex-lg-row flex-md-row my-5 px-4 justify-content-around gap-4 flex-wrap">
        <div className="text-center mb-4" style={{ flex: '1' }}>
          <h3 className="py-2 fw-bold fs-3 my-2">Reflections</h3>
          <p className="py-2 fw-bold my-2">
            TGPSC Group-1 Mains Examination 2024 Questions Reflections from CivicCentre IAS
          </p>
          <img
            src="/assets/logo.png"
            alt="Reflection Preview"
            className="img-fluid mb-3"
            style={{ maxHeight: '300px', width: '100%', objectFit: 'cover' }}
          />
          <Button variant="dark">Download</Button>
        </div>

        {/* Scrollable questions area */}
        <div
          className="d-flex flex-column align-items-start gap-2"
          style={{
            maxHeight: '500px',
            overflowY: 'auto',
            flex: '1',
          }}
        >
          {[...Array(7)].map((_, index) => (
            <div
              className="border rounded shadow-sm p-3 w-100"
              key={index}
            >
              <h6>
                TGPSC Group-1 Mains Examination 2024 Questions Reflections from CivicCentre IAS
              </h6>
              <p>75/150 Questions Reflected from CivicCentre Test Series</p>
            </div>
          ))}
        </div>
      </section>

      {/* Achievements Section */}
      <section className="my-5 p-4 bg-light">
        <h3 className="text-center fw-bold fs-3 mb-3">Civic Centre's Achievements</h3>

        <div className="d-flex flex-wrap justify-content-start gap-3 py-2 mb-4">
          <Button variant="outline-dark">All</Button>
          <Button variant="outline-dark">TGPSC</Button>
          <Button variant="outline-dark">APPSC</Button>
          <Button variant="outline-dark">UPSC</Button>

        </div>

        <Carousel style={{ height: "350px" }}>
          {[1, 4, 3].map((num) => (
            <Carousel.Item key={num}>
              <motion.img
                className="d-block w-100 rounded"
                src={`assets/banner${num}.jpg`}
                alt={`Slide ${num}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1 }}
                style={{ height: "350px" }}
              />
            </Carousel.Item>
          ))}
        </Carousel>
      </section>

      {/* Testimonial Section */}
      <section className="py-5 px-4 mx-2 rounded bg-white border">
        <div className="d-flex flex-col flex-lg-row flex-md-row gap-4 justify-content-between align-items-center w-100">
          {/* Video Testimonial */}
          <div className="flex-fill col-12 col-md-6" >
            <div className="ratio ratio-16x9 rounded shadow overflow-hidden">
              <iframe
                src=""
                title="Video Testimonial"
                allowFullScreen
                className="w-100 h-100 border-0"
              />
            </div>
            <div className="text-center mt-3">
              <Button variant="dark" className="w-100 py-2 shadow">Speak to our Expert</Button>
            </div>
          </div>

          {/* Student Reviews */}
          <div className="flex-fill d-flex flex-column col-12 col-md-6" >
            <h4 className="text-center py-2 fw-bold fs-3">Student Testimonials</h4>
            <div className="d-flex flex-column gap-3 overflow-auto" style={{ maxHeight: '500px' }}>
              {[...Array(7)].map((_, idx) => (
                <div key={idx} className="d-flex align-items-start gap-3 border rounded p-3 bg-light">
                  <i className="bi bi-person fs-1 text-secondary"></i>
                  <div className="review-content">
                    <p className="mb-2">
                      I have enrolled in TSPSC Group 2 Test series. I loved their standard of questions & key,
                      along with detailed explanations to each and every option. It made my revision easy.
                      I strongly recommend CivicCentre.
                    </p>
                    <h6 className="mb-0">Karthik Koneti</h6>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Social Media Section */}
      <section className="bg-white py-5 d-flex justify-content-center">
        <div className=" bg-light text-center p-8 rounded-2 m-4 shadow"
          style={{
            width: "90%",
            marginTop: "-50px",
            zIndex: 10,
            padding: "30px 0",
          }}>
          <h4 className="text-center fw-bold fs-4 mb-2">
            Join India's Best Knowledge Bank for All Competitive Exams
          </h4>
          <p className="text-center fw-bold mb-4">Social Media Accounts</p>

          <div className="d-flex flex-wrap justify-content-center gap-4 p-8">
            {[
              { icon: <Youtube size={40} color="#FF0000" />, label: '130K Subscribers' },
              { icon: <Instagram size={40} color="#C13584" />, label: '130K Followers' },
              { icon: <Facebook size={40} color="#3b5998" />, label: '130K Likes' },
              { icon: <Twitter size={40} color="#1DA1F2" />, label: '130K Followers' },
              { icon: <Whatsapp size={40} color="#25D366" />, label: '130K Members' },
              { icon: <Telegram size={40} color="#0088cc" />, label: '130K Members' },
            ].map((media, idx) => (
              <div
                key={idx}
                className="d-flex align-items-center justify-content-around gap-3 border rounded p-3 bg-white shadow-sm"
                style={{ maxWidth: '250px', flex: '1 1 250px' }}
              >
                <div>{media.icon}</div>
                <div className="d-flex flex-col gap-2">
                  <p className="mb-1">{media.label}</p>
                  <Button variant="outline-dark" className="w-auto">Join Now</Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Live Sessions Section */}
      <section className="py-5 px-4">
        <div className="w-100 ">
          <h4 className="fw-bold text-center fs-3 mb-4">Free Live Sessions</h4>

          {/* Main Session - You can replace this with actual content */}
          <div className="border rounded mb-4 p-4 text-center shadow-sm ratio ratio-16x9" style={{ aspectRatio: "16 / 9", maxHeight: "500px" }} >
            <iframe
              src=""
              title="Video Testimonial"
              allowFullScreen
              className="w-100 h-100 border-0"
            />
          </div>

          {/* Sub Sessions */}
          <div className="d-flex flex-wrap justify-content-center gap-4">
            {[1, 2, 3].map((session, idx) => (
              <div
                key={idx}
                className="sessions border rounded p-4 shadow-sm"
                style={{ flex: "1 1 280px", minHeight: "250px" }}
              >
                <p className="mb-0 text-center">Live Session {session}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* News Section */}
      <section className="py-3 px-4 border mx-2 rounded">
        <div className="d-flex flex-col flex-lg-row flex-md-row justify-content-around align-items-center w-100">
          {/* Main Article */}
          <div className="p-4 mb-5 d-flex flex-col justify-content-center col-12 col-md-6" >
            <h4 className="fw-bold mb-2 fs-3 text-center">Civic Centre in News</h4>
            <p className="mb-1 fw-bold text-center">The HINDU</p>
            <img
              src=" /assets/logo.png"
              alt="News coverage"
              className="img-fluid rounded my-4 shadow "
              style={{ minHeight: "500px", objectFit: "contain", width: "100%" }}
            />
            <p className="mb-0 text-center">Date: 27-December-2024</p>
          </div>

          {/* News Cards */}
          <div
            className="d-flex flex-column gap-3 p-2 col-12 col-md-6"
            style={{
              maxHeight: '600px',
              overflowY: 'auto',
            }}
          >
            {[1, 2, 3, 4, 5].map((news, idx) => (
              <div
                key={idx}
                className="news border rounded bg-white p-3 shadow-sm"
              >
                <h6 className="fw-bold">The Hindu News</h6>
                <div className="news-content d-flex justify-content-between align-items-start mt-2">
                  <div>
                    <p className="mb-1">Topic: Civic Centre Results</p>
                    <p className="mb-0">Date: 29-Dec-2024</p>
                  </div>
                  <div>
                    <Button size="sm" variant="outline-dark">
                      Know More
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="pt-5 bg-light text-dark mt-5">
        <Container fluid className="px-4 px-md-5">
          {/* Links, Address & Socials */}
          <div className="row row-cols-1 row-cols-md-5 gy-5 text-md-start">
            {/* Quick Links */}
            <div>
              <h5 className="fw-bold mb-3">Quick Links</h5>
              <div className="d-flex flex-column gap-1">
                <a href="">Courses</a>
                <a href="">Masters</a>
                <a href="">Study Materials</a>
                <a href="">Current Affairs</a>
                <a href="">Videos</a>
              </div>
            </div>

            {/* Resources */}
            <div>
              <h5 className="fw-bold mb-3">Resources</h5>
              <div className="d-flex flex-column gap-1">
                <a href="">Free Tests</a>
                <a href="">About Us</a>
                <a href="">FAQs</a>
              </div>
            </div>

            {/* Contact */}
            <div>
              <h5 className="fw-bold mb-3">Contact Us</h5>
              <div className="d-flex flex-column gap-1">
                <span>7013495019</span>
                <span>6308098329</span>
                <Button variant="dark" size="sm" className="mt-2 w-100">
                  Schedule a Free Call
                </Button>
              </div>
            </div>

            {/* Social Media */}
            <div>
              <h5 className="fw-bold mb-3">Connect with Us</h5>
              <div className="d-flex justify-content-center justify-content-md-start flex-wrap gap-3">
                <Youtube size={28} />
                <Instagram size={28} />
                <Facebook size={28} />
                <Twitter size={28} />
                <Whatsapp size={28} />
              </div>
            </div>

            {/* Address Section */}
            <div>
              <h5 className="fw-bold mb-3">Our Branch Address</h5>
              <div className="small text-start">
                <p><strong>Hyderabad, Ashoknagar:</strong> Ground Floor, Blue Sapphire building, Ashok Nagar Cross Roads, Telangana 500020</p>
                <p><strong>Vizag:</strong> VUDA Complex, Ground Floor, MVP Main Rd, Sector 7, MVP Colony, Visakhapatnam, AP 530017</p>
                <p><strong>Nalgonda:</strong> VUDA Complex, Ground Floor, MVP Main Rd, Sector 7, MVP Colony, Visakhapatnam, AP 530017</p>
              </div>
            </div>
          </div>

          <hr className="my-5" />

          {/* Tools & App Section */}
          <div className="d-flex flex-column flex-lg-row justify-content-around gap-5 align-items-center text-center text-lg-start">
            {/* WhatsApp App Link */}
            <div>
              <h5 className="fw-bold mb-3">Get The App Link To Your WhatsApp</h5>
              <div className="bg-white p-3 rounded d-flex flex-sm-row gap-2 align-items-center justify-content-center">
                <select className="form-select w-auto" defaultValue="+91">
                  <option value="+91">🇮🇳 +91</option>
                  <option value="+1">🇺🇸 +1</option>
                  <option value="+44">🇬🇧 +44</option>
                  <option value="+61">🇦🇺 +61</option>
                  <option value="+81">🇯🇵 +81</option>
                </select>
                <input type="text" className="form-control w-100 w-sm-50" placeholder="Enter WhatsApp Number" />
              </div>

              <Button variant="dark">Get Link</Button>
            </div>

            {/* App Download */}
            <div>
              <div className="fw-bold fs-5 mb-3">Download our Apps</div>
              <div className="d-flex justify-content-center gap-3 flex-wrap">
                <div className="d-flex border p-3 rounded shadow-sm bg-light gap-3 align-items-center">
                  <img src="/assets/playstore.png" alt="" style={{ width: '32px' }} />
                  <span>
                    Download on <br />
                    <strong>Google Play</strong>
                  </span>
                </div>
                <div className="d-flex border p-3 rounded shadow-sm bg-light gap-3 align-items-center">
                  <img src="/assets/apple.png" alt="" style={{ width: '32px' }} />
                  <span>
                    Download on <br />
                    <strong>App Store</strong>
                  </span>
                </div>
              </div>
            </div>

            {/* Location */}
            <div>
              <h5 className="fw-bold mb-3">Visit Us</h5>
              <Button variant="outline-dark">Maps</Button>
            </div>
          </div>

          <hr className="my-5" />

          {/* Enquiry & Policies */}
          <div className="text-center">
            <Button variant="dark" className="mb-3">Click Here To Submit The Enquiry Form</Button>
          </div>

          {/* Copyright */}
          <p className="d-flex justify-content-around mt-4 mb-0 text-center small text-muted">&copy; 2025 ExamOTT. All Rights Reserved.
            <span>Terms and Conditions</span>
            <span>Privacy Policy</span>
            <span>Cancellation and Refund Policy</span>
          </p>
        </Container>
      </footer>
    </div>
  );
}
