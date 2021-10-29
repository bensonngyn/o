import React from "react";
import { createContext } from "react";
import { Line, Bar } from "react-chartjs-2";
import { BrowserRouter, Route, Switch, Redirect, NavLink, Link, useLocation } from "react-router-dom";
import { PropTypes } from "prop-types";
import PerfectScrollbar from "perfect-scrollbar";
import { Nav, NavLink as ReactstrapNavLink } from "reactstrap";
import {
  Card,
  CardHeader,
  CardBody,
  CardTitle,
  FormGroup,
  Input,
  Table,
  Row,
  Col,
  Form,
} from "reactstrap";

var ps;

var routes = [
  {
    path: "/stake",
    name: "Stake (3,3)",
    icon: "tim-icons icon-coins",
    component: Stake,
  },
  {
    path: "/bond",
    name: "Bond (4,4)",
    icon: "tim-icons icon-bank",
    component: Bond,
  },
  {
    path: "/fuse",
    name: "Fuse (9,9)",
    icon: "tim-icons icon-planet",
    component: Fuse,
  },
  {
    path: "/riskgrowth",
    name: "Risk Growth",
    icon: "tim-icons icon-sound-wave",
    component: RiskGrowth,
  }
];

function Stake(props) {
  const [ohmStaked, setOhmStaked] = React.useState(10);
  const [currPrice, setCurrPrice] = React.useState(1300);
  const [rewardYield, setRewardYield] = React.useState(0.00393);
  const [priceChange, setPriceChange] = React.useState(0);
  const [rewardRateReduction, setRewardRateReduction] = React.useState(0);
  var ohmsAtEveryEpoch = [ohmStaked];
  for (let epoch = 1; epoch < 2095; epoch++) {
    ohmsAtEveryEpoch.push( ohmsAtEveryEpoch.at(-1) * (1 + rewardYield*(1-(rewardRateReduction * epoch / 1095))));
  }

  var daysArray = [];
  var daysArrayData = [];
  var mults = [];
  var multsData = [];
  for (let m = 1; m < 101; m++) {
    mults.push(m);
    multsData.push(Math.ceil(Math.log(m) / Math.log(1+rewardYield) / 3))
  }

  for (let day = 0; day < 366; day++) {
    daysArray.push(day);
    daysArrayData.push(ohmsAtEveryEpoch[day*3]);
  }

  function changeOhmStaked(e) { setOhmStaked(parseFloat(e.target.value)); resetEpochArray(); }
  function changeCurrPrice(e) { setCurrPrice(parseFloat(e.target.value)); resetEpochArray(); }
  function changeRewardYield(e) { setRewardYield(parseFloat(e.target.value)/100); resetEpochArray(); }
  function changePriceChange(e) { setPriceChange(parseFloat(e.target.value)/100); resetEpochArray(); }
  function changeRewardRateReduction(e) { setRewardRateReduction(parseFloat(e.target.value)/100); resetEpochArray(); }

  function resetEpochArray() {
    ohmsAtEveryEpoch = [ohmStaked];
    for (let epoch = 1; epoch < 2095; epoch++) {
      ohmsAtEveryEpoch.push( ohmsAtEveryEpoch.at(-1) * (1 + rewardYield*(1-(rewardRateReduction * epoch / 1095))));
    }
  }

  return (
    <>
      <div className="content">
      <Row>
          <Col lg="8">
            <Card>
              <CardHeader>
                <h4 className="title">Input Values Here</h4>
              </CardHeader>
              <CardBody>
                <Form>
                  <Row>
                    <Col className="pr-md-1" md="4">
                      <FormGroup>
                        <label>Amount of OHM Staked</label>
                        <Input
                          placeholder="Surely more than zero, right Anon-kun?"
                          type="text"
                          defaultValue = "10"
                          onChange = {(e) => changeOhmStaked(e)}
                        />
                      </FormGroup>
                    </Col>
                    <Col className="pr-md-1" md="3">
                      <FormGroup>
                        <label>Current Price of OHM ($)</label>
                        <Input placeholder=""
                        type="text" 
                        defaultValue = "1300"
                        onChange = {(e) => changeCurrPrice(e)}/>
                      </FormGroup>
                    </Col>
                    <Col className="pr-md-1" md="3">
                      <FormGroup>
                        <label htmlFor="exampleInputEmail1">
                          Reward Yield Rate (%)
                        </label>
                        <Input placeholder=""
                        type="text"
                        defaultValue = "0.393"
                        onChange = {(e) => changeRewardYield(e)}/>
                      </FormGroup>
                    </Col>
                  </Row>
                  <Row>
                    <Col className="pr-md-1" md="5">
                      <FormGroup>
                        <label>Price Change (%)</label>
                        <Input
                          placeholder="0"
                          defaultValue = "0"
                          type="text"
                          onChange = { (e) => changePriceChange(e) }
                        />
                      </FormGroup>
                    </Col>
                    <Col className="pr-md-1" md="5">
                      <FormGroup>
                        <label>Reward Rate Reduction (%)</label>
                        <Input
                          placeholder="0"
                          defaultValue = "0"
                          type="text"
                          onChange = { (e) => changeRewardRateReduction(e) }
                        />
                      </FormGroup>
                    </Col>
                  </Row>
                </Form>
              </CardBody>
            </Card>
          </Col>
          <Col lg="4">
            <Card>
              <CardHeader>
                <h4 className="title">Results</h4>
              </CardHeader>
              <CardBody>
                <Form>
                  <Row>
                    <Col className="pr-md-1" md="5">
                      <FormGroup>
                        <label>Amount Invested ($)</label>
                        <Input
                          defaultValue = {ohmStaked * currPrice}
                          type="text"
                        />
                      </FormGroup>
                      <FormGroup>
                        <label>Yearly APY (%)</label>
                        <Input
                          defaultValue = {Math.round((Math.pow(1+rewardYield, 1095) - 1) * 100)}
                          type="text"
                        />
                      </FormGroup>
                    </Col>
                  </Row>
                </Form>
              </CardBody>
            </Card>
          </Col>
        </Row>
        <Row>
          <Col lg="4">
            <Card className="card-chart">
              <CardHeader>
                <h5 className="card-category">Amount of Ω after x days</h5>
                <CardTitle tag="h3">
                  <i className="tim-icons icon-bell-55 text-info" /> OHM ↬ Days
                </CardTitle>
              </CardHeader>
              <CardBody>
                <div className="chart-area">
                  <Line
                    data={ (canvas) => {
                      let ctx = canvas.getContext("2d");
                  
                      let gradientStroke = ctx.createLinearGradient(0, 230, 0, 50);
                  
                      gradientStroke.addColorStop(1, "rgba(29,140,248,0.2)");
                      gradientStroke.addColorStop(0.4, "rgba(29,140,248,0.0)");
                      gradientStroke.addColorStop(0, "rgba(29,140,248,0)"); //blue colors
                  
                      return {
                        labels: daysArray,
                        datasets: [
                          {
                            label: "Day #",
                            fill: true,
                            backgroundColor: gradientStroke,
                            borderColor: "#1f8ef1",
                            borderWidth: 2,
                            borderDash: [],
                            borderDashOffset: 0.0,
                            pointBackgroundColor: "#1f8ef1",
                            pointBorderColor: "rgba(255,255,255,0)",
                            pointHoverBackgroundColor: "#1f8ef1",
                            pointBorderWidth: 20,
                            pointHoverRadius: 3,
                            pointHoverBorderWidth: 15,
                            pointRadius: 0.7,
                            data: daysArrayData,
                          },
                        ],
                      };
                    }}
                    options={{
                      maintainAspectRatio: false,
                      legend: {
                        display: false,
                      },
                      tooltips: {
                        callbacks: {
                          title: (c) => { return "Day " + c[0].xLabel; },
                          label: (c) => { return "You will have " + c.yLabel.toFixed(2) + "Ω"; },
                        },
                        backgroundColor: "#f5f5f5",
                        titleFontColor: "#333",
                        bodyFontColor: "#666",
                        bodySpacing: 4,
                        xPadding: 12,
                        mode: "nearest",
                        intersect: 0,
                        position: "nearest",
                      },
                      responsive: true,
                      scales: {
                        yAxes: [
                          {
                            barPercentage: 1.6,
                            gridLines: {
                              drawBorder: false,
                              color: "rgba(29,140,248,0.0)",
                              zeroLineColor: "transparent",
                            },
                            ticks: {
                              maxTicksLimit: 10,
                              suggestedMin: 0,
                              suggestedMax: 800,
                              padding: 15,
                              fontColor: "#9a9a9a",
                            },
                          },
                        ],
                        xAxes: [
                          {
                            barPercentage: 1.6,
                            gridLines: {
                              drawBorder: false,
                              color: "rgba(29,140,248,0.1)",
                              zeroLineColor: "transparent",
                            },
                            ticks: {
                              maxTicksLimit: 15,
                              padding: 15,
                              fontColor: "#9a9a9a",
                            },
                          },
                        ],
                      },
                    }}
                  />
                </div>
              </CardBody>
            </Card>
          </Col>
          <Col lg="4">
            <Card className="card-chart">
              <CardHeader>
                <h5 className="card-category">Amount of Days until OHM multiplies</h5>
                <CardTitle tag="h3">
                  <i className="tim-icons icon-send text-success" /> Days ↬ Multiplier
                </CardTitle>
              </CardHeader>
              <CardBody>
                <div className="chart-area">
                  <Line
                    data={(canvas) => {
                      let ctx = canvas.getContext("2d");

                      let gradientStroke = ctx.createLinearGradient(0, 230, 0, 50);

                      gradientStroke.addColorStop(1, "rgba(66,134,121,0.15)");
                      gradientStroke.addColorStop(0.4, "rgba(66,134,121,0.0)"); //green colors
                      gradientStroke.addColorStop(0, "rgba(66,134,121,0)"); //green colors

                      return {
                        labels: mults,
                        datasets: [
                          {
                            label: "Invested OHM has Multiplied by",
                            fill: true,
                            backgroundColor: gradientStroke,
                            borderColor: "#00d6b4",
                            borderWidth: 2,
                            borderDash: [],
                            borderDashOffset: 0.0,
                            pointBackgroundColor: "#00d6b4",
                            pointBorderColor: "rgba(255,255,255,0)",
                            pointHoverBackgroundColor: "#00d6b4",
                            pointBorderWidth: 20,
                            pointHoverRadius: 4,
                            pointHoverBorderWidth: 15,
                            pointRadius: 0.9,
                            data: multsData,
                          },
                        ],
                      };
                    }}
                    options={{
                      maintainAspectRatio: false,
                      legend: {
                        display: false,
                      },
                      tooltips: {
                        callbacks: {
                          title: (c) => { return "Day " + c[0].yLabel; },
                          label: (c) => { return "Your OHM has " + c.xLabel + "x"; },
                        },
                        backgroundColor: "#f5f5f5",
                        titleFontColor: "#333",
                        bodyFontColor: "#666",
                        bodySpacing: 4,
                        xPadding: 12,
                        mode: "nearest",
                        intersect: 0,
                        position: "nearest"
                      },
                      responsive: true,
                      scales: {
                        yAxes: [
                          {
                            barPercentage: 1.6,
                            gridLines: {
                              drawBorder: false,
                              color: "rgba(29,140,248,0.0)",
                              zeroLineColor: "transparent",
                            },
                            ticks: {
                              suggestedMin: 50,
                              suggestedMax: 125,
                              padding: 20,
                              fontColor: "#9e9e9e",
                            },
                          },
                        ],
                  
                        xAxes: [
                          {
                            barPercentage: 1.6,
                            gridLines: {
                              drawBorder: false,
                              color: "rgba(0,242,195,0.1)",
                              zeroLineColor: "transparent",
                            },
                            ticks: {
                              padding: 20,
                              fontColor: "#9e9e9e",
                              maxTicksLimit: 15
                            },
                          },
                        ],
                      },
                    }}
                  />
                </div>
              </CardBody>
            </Card>
          </Col>
          <Col lg="4">
            <Card className="card-chart">
              <CardHeader>
                <h5 className="card-category">Percent of OHM Staked</h5>
                <CardTitle tag="h3">
                  <i className="tim-icons icon-delivery-fast text-primary" />{" "}Staked • Unstaked
                </CardTitle>
              </CardHeader>
              <CardBody>
                <div className="chart-area">
                  <Bar
                    data={ (canvas) => {
                      let ctx = canvas.getContext("2d");
                  
                      let gradientStroke = ctx.createLinearGradient(0, 230, 0, 50);
                  
                      gradientStroke.addColorStop(1, "rgba(72,72,176,0.1)");
                      gradientStroke.addColorStop(0.4, "rgba(72,72,176,0.0)");
                      gradientStroke.addColorStop(0, "rgba(119,52,169,0)"); //purple colors
                  
                      return {
                        labels: ["Staked (%)", "Unstaked (%)"],
                        datasets: [
                          {
                            fill: true,
                            backgroundColor: gradientStroke,
                            hoverBackgroundColor: gradientStroke,
                            borderColor: "#d048b6",
                            borderWidth: 2,
                            borderDash: [],
                            borderDashOffset: 0.0,
                            data: [92.69, 7.31],
                          },
                        ],
                      };
                    }}
                    options={{
                      maintainAspectRatio: false,
                      legend: {
                        display: false,
                      },
                      tooltips: {
                        backgroundColor: "#f5f5f5",
                        titleFontColor: "#333",
                        bodyFontColor: "#666",
                        bodySpacing: 4,
                        xPadding: 12,
                        mode: "nearest",
                        intersect: 0,
                        position: "nearest",
                      },
                      responsive: true,
                      scales: {
                        yAxes: [
                          {
                            gridLines: {
                              drawBorder: false,
                              color: "rgba(225,78,202,0.1)",
                              zeroLineColor: "transparent",
                            },
                            ticks: {
                              suggestedMin: 0,
                              suggestedMax: 100,
                              padding: 20,
                              fontColor: "#9e9e9e",
                            },
                          },
                        ],
                        xAxes: [
                          {
                            gridLines: {
                              drawBorder: false,
                              color: "rgba(225,78,202,0.1)",
                              zeroLineColor: "transparent",
                            },
                            ticks: {
                              padding: 20,
                              fontColor: "#9e9e9e",
                            },
                          },
                        ],
                      },
                    }}
                  />
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>
        <Row>
          <Col lg="12" md="12">
            <Card>
              <CardHeader>
                <CardTitle tag="h4" className="text-success">Quick Summary</CardTitle>
              </CardHeader>
              <CardBody>
                <Table className="tablesorter" responsive>
                  <thead className="text-primary">
                    <tr>
                      <th>Amount of OHM in...</th>
                      <th>Ω</th>
                      <th>USD Value 🤢</th>
                      <th>% ROI</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>30 Days</td>
                      <td>{ohmsAtEveryEpoch[90].toFixed(3)}</td>
                      <td>{'$' + (ohmsAtEveryEpoch[90]*currPrice*(1+priceChange)).toLocaleString()}</td>
                      <td>{ String(Math.round(((ohmsAtEveryEpoch[90]*currPrice*(1+priceChange)) / (ohmStaked * currPrice)-1) * 100)) + '%' }</td>
                    </tr>
                    <tr>
                      <td>60 Days</td>
                      <td>{ohmsAtEveryEpoch[180].toFixed(3)}</td>
                      <td>{'$' + (ohmsAtEveryEpoch[180]*currPrice*(1+priceChange)).toLocaleString()}</td>
                      <td>{ String(Math.round(((ohmsAtEveryEpoch[180]*currPrice*(1+priceChange)) / (ohmStaked * currPrice)-1) * 100)) + '%' }</td>
                    </tr>
                    <tr>
                      <td>90 Days</td>
                      <td>{ohmsAtEveryEpoch[270].toFixed(3)}</td>
                      <td>{'$' + (ohmsAtEveryEpoch[270]*currPrice*(1+priceChange)).toLocaleString()}</td>
                      <td>{ String(Math.round(((ohmsAtEveryEpoch[270]*currPrice*(1+priceChange)) / (ohmStaked * currPrice)-1) * 100)) + '%' }</td>
                    </tr>
                    <tr>
                      <td>180 Days</td>
                      <td>{ohmsAtEveryEpoch[540].toFixed(3)}</td>
                      <td>{'$' + (ohmsAtEveryEpoch[540]*currPrice*(1+priceChange)).toLocaleString()}</td>
                      <td>{ String(Math.round(((ohmsAtEveryEpoch[540]*currPrice*(1+priceChange)) / (ohmStaked * currPrice)-1) * 100)) + '%' }</td>
                    </tr>
                    <tr>
                      <td>365 Days</td>
                      <td>{ohmsAtEveryEpoch[1095].toFixed(3)}</td>
                      <td>{'$' + (ohmsAtEveryEpoch[1095]*currPrice*(1+priceChange)).toLocaleString()}</td>
                      <td>{ String(Math.round(((ohmsAtEveryEpoch[1095]*currPrice*(1+priceChange)) / (ohmStaked * currPrice)-1) * 100)) + '%' }</td>
                    </tr>
                  </tbody>
                </Table>
                <Table striped className="tablesorter" responsive>
                  <thead className="text-primary">
                    <tr>
                      <th>Invested OHM will...</th>
                      <th>Days</th>
                      <th>USD Value 🤢</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>2X</td>
                      <td>{ Math.ceil( Math.log(2) / Math.log(1+rewardYield) / 3) + "‏‏‎ ‎‏‏‎ ‎‏‏‎ ‎‏‏‎‏‏‎ ‎ ‎‏‏‎ ‎‏‏‎ ‎‏‏‎ ‎‏‏‎ ‎"}</td>
                      <td>{ '$' + (2 * ohmStaked * currPrice * (1+priceChange)).toLocaleString() + '.00' + "‏‏‎ ‎‏‏‎ ‎‏‏‎ ‏‏‎ ‎‏‏‎‏‏‎ ‎‏‏‎ ‎‏‏‎ ‎‏‏‎ ‎‏‏‎ ‎‏‏‎ ‎‏‏‎ ‎‏‏‎ ‎‏‏‎ ‎ ‎‏‏‎ ‎‎‏‏‎ ‎‏‏‎ ‎‏‏‎ ‎"}</td>
                    </tr>
                    <tr>
                      <td>5X</td>
                      <td>{ Math.ceil( Math.log(5) / Math.log(1+rewardYield) / 3) }</td>
                      <td>{ '$' + (5 * ohmStaked * currPrice * (1+priceChange)).toLocaleString() + '.00' }</td>
                    </tr>
                    <tr>
                      <td>10X</td>
                      <td>{ Math.ceil( Math.log(10) / Math.log(1+rewardYield) / 3) }</td>
                      <td>{ '$' + (10 * ohmStaked * currPrice * (1+priceChange)).toLocaleString() + '.00' }</td>
                    </tr>
                    <tr>
                      <td>100X</td>
                      <td>{ Math.ceil( Math.log(100) / Math.log(1+rewardYield) / 3) }</td>
                      <td>{ '$' + (100 * ohmStaked * currPrice * (1+priceChange)).toLocaleString() + '.00' }</td>
                    </tr>
                  </tbody>
                </Table>

                <Table className="tablesorter" responsive>
                  <thead className="text-primary">
                    <tr>
                      <th>Amount of OHM owned</th>
                      <th >Title ‏‏‎ ‎‏‏‎ ‎‏‏‎ ‎‏‏‎ ‎‏‏‎ ‎‏‏‎ ‎‏‏‎ ‎‏‏‎ ‎‏‏‎ ‎‏‏‎ ‎‏‏‎ ‎‏‏‎ ‎‏‏‎ ‎‏‏‎ ‎‏‏‎ ‎‏‏‎ ‎‏‏‎ ‎‏‏‎ ‎‏‏‎ ‎‏‏‎ ‎‏‏‎ ‎‏‏‎ ‎‏‏‎ ‎‏‏‎ ‎‏‏‎ ‎‏‏‎ ‎‏‏‎ ‎‏‏‎ ‎‏‏‎ ‎‏‏‎ ‎‏‏‎ ‎‏‏‎ ‎‏‏‎ ‎‏‏‎ ‎‏‏‎ ‎‏‏‎ ‎‏‏‎ ‎‏‏‎ ‎‏‏‎ ‎‏‏‎ ‎‏‏‎ ‎‏‏‎ ‎‏‏‎ ‎‏‏‎ ‎‏‏‎ ‎‏‏‎ ‎‏‏‎ ‎‏‏‎ ‎‏‏‎ ‎‏‏‎ ‎‏‏‎ ‎‏‏‎ ‎‏‏‎‎‏‏‎ ‎‏‏‎ ‎‏‏‎ ‎‏‏‎ ‎‏‏‎ ‎‏‏‎ ‎‏‏‎ ‎‏‏‎ ‎‏‏‎ ‎‏‏‎ ‎‏‏‎ ‎‏‏‎ ‎‏‏‎ ‎‏‏‎ ‎‏‏‎ ‎‏‏‎ ‎‏‏‎ ‎‏‏‎ ‎‏‏‎ ‎‏‏‎ ‎‏‏‎ ‎‏‏‎ ‎‏‏‎ ‎‏‏‎ ‎‏‏‎ ‎‏‏‎ ‎‏‏‎ ‎‏‏‎ ‎‏‏‎ ‎‏‏‎ ‎‏‏‎ ‎</th>
                    </tr>
                  </thead>
                  <tbody>
                  <tr>
                      <td>0</td>
                      <td>NGMI</td>
                    </tr>
                    <tr>
                      <td>1 - 25</td>
                      <td>Ohmie</td>
                    </tr>
                    <tr>
                      <td>26 - 100</td>
                      <td>Pantheon</td>
                    </tr>
                    <tr>
                      <td>101 - 1,000</td>
                      <td>Trojan King</td>
                    </tr>
                    <tr>
                      <td>1,001 - 25,000</td>
                      <td>Philosopher</td>
                    </tr>
                    <tr>
                      <td>25,001+</td>
                      <td>Greek God</td>
                    </tr>
                  </tbody>
                </Table>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </div>
    </>
  );
}

function Bond() {
  return (
    <>
      <div className="content">
      <Row>
          <Col lg="8">
            <Card>
              <CardHeader>
                <h4 className="title">Coming soon!</h4>
              </CardHeader>
            </Card>
          </Col>
        </Row>
      </div>
    </>
  );
}

function Fuse() {
  return (
    <>
      <div className="content">
      <Row>
          <Col lg="8">
            <Card>
              <CardHeader>
                <h4 className="title">Coming soon!</h4>
              </CardHeader>
            </Card>
          </Col>
        </Row>
      </div>
    </>
  );
}

function RiskGrowth() {
  return (
    <>
      <div className="content">
      <Row>
          <Col lg="8">
            <Card>
              <CardHeader>
                <h4 className="title">Coming soon!</h4>
              </CardHeader>
            </Card>
          </Col>
        </Row>
      </div>
    </>
  );
}

function Sidebar(props) {
  const BackgroundColorContext = createContext({
    color: "blue",
    changeColor: (color) => {},
  });
  return (
    <BackgroundColorContext.Consumer>
      {({ color }) => (
        <div className="sidebar" data={color}>
          <div className="sidebar-wrapper">
              <div className="logo" style={{paddingLeft: "40px"}}>
                <a
                  className="simple-text logo-normal"
                  target="_blank"
                >
                  OHM CALCULATORS
                </a>
              </div>
            <Nav>
              {routes.map((prop, key) => {
                return (
                  <li>
                    <NavLink
                      to={prop.path}
                      className="nav-link"
                      activeClassName="active"
                    >
                      <i className={prop.icon} />
                      <p>{prop.name}</p>
                    </NavLink>
                  </li>
                );
              })}
            </Nav>
          </div>
        </div>
      )}
    </BackgroundColorContext.Consumer>
  );
}

function App(props) {
  const location = useLocation();
  const mainPanelRef = React.useRef(null);
  const BackgroundColorContext = createContext({
    color: "blue",
    changeColor: (color) => {},
  });
  
  const getRoutes = (routes) => {
    return routes.map((prop, key) => {
      return (
        <Route
          path={prop.path}
          component={prop.component}
          key={key}
        />
      );
    });
  };

  React.useEffect(() => {
    if (navigator.platform.indexOf("Win") > -1) {
      document.documentElement.className += " perfect-scrollbar-on";
      document.documentElement.classList.remove("perfect-scrollbar-off");
      ps = new PerfectScrollbar(mainPanelRef.current, {
        suppressScrollX: true,
      });
      let tables = document.querySelectorAll(".table-responsive");
      for (let i = 0; i < tables.length; i++) {
        ps = new PerfectScrollbar(tables[i]);
      }
    }
    // Specify how to clean up after this effect:
    return function cleanup() {
      if (navigator.platform.indexOf("Win") > -1) {
        ps.destroy();
        document.documentElement.classList.add("perfect-scrollbar-off");
        document.documentElement.classList.remove("perfect-scrollbar-on");
      }
    };
  });
  React.useEffect(() => {
    if (navigator.platform.indexOf("Win") > -1) {
      let tables = document.querySelectorAll(".table-responsive");
      for (let i = 0; i < tables.length; i++) {
        ps = new PerfectScrollbar(tables[i]);
      }
    }
    document.documentElement.scrollTop = 0;
    document.scrollingElement.scrollTop = 0;
    if (mainPanelRef.current) {
      mainPanelRef.current.scrollTop = 0;
    }
  }, [location]);
  return (
    <BackgroundColorContext.Consumer>
      {({ color, changeColor }) => (
        <React.Fragment>
          <div className="wrapper">
            <Sidebar
              routes={routes}
            />
            <div className="main-panel" ref={mainPanelRef} data={color}>
              <Switch>
                {getRoutes(routes)}
                <Redirect from="*" to="/stake"/>
              </Switch>
            </div>
          </div>
        </React.Fragment>
      )}
    </BackgroundColorContext.Consumer>
  );
}

export default App;