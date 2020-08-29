webpackHotUpdate("static\\development\\pages\\index.js",{

/***/ "./components/Workouts.tsx":
/*!*********************************!*\
  !*** ./components/Workouts.tsx ***!
  \*********************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var react_bootstrap__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react-bootstrap */ "./node_modules/react-bootstrap/esm/index.js");
/* harmony import */ var recharts__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! recharts */ "./node_modules/recharts/es6/index.js");
var _this = undefined,
    _jsxFileName = "H:\\git\\activity-trends\\components\\Workouts.tsx";


var __jsx = react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement;



var Workouts = function Workouts(_ref) {
  var data = _ref.data;
  return __jsx(react_bootstrap__WEBPACK_IMPORTED_MODULE_1__["Container"], {
    __self: _this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 28,
      columnNumber: 9
    }
  }, __jsx("p", {
    __self: _this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 29,
      columnNumber: 13
    }
  }, data.length, " workouts recorded."), __jsx(recharts__WEBPACK_IMPORTED_MODULE_2__["PieChart"], {
    width: 800,
    height: 400,
    __self: _this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 30,
      columnNumber: 13
    }
  }, __jsx(recharts__WEBPACK_IMPORTED_MODULE_2__["Pie"], {
    data: extractWorkoutTypes(data),
    cx: 300,
    cy: 200,
    labelLine: false //label={renderCustomizedLabel}
    ,
    outerRadius: 80,
    fill: "#8884d8",
    __self: _this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 31,
      columnNumber: 17
    }
  })));
};

function extractWorkoutTypes(data) {
  var result = {};
  var types = data.map(function (datum) {
    return datum["Type"];
  });

  for (var i = 0; i < types.length; i++) {
    var num = types[i];
    result[num] = (result[num] || 0) + 1;
  }

  var uniqueTypes = types.filter(function (v, i, self) {
    self.indexOf(v) === i;
  });
  return uniqueTypes.map(function (type) {
    return {
      name: type,
      value: result[type]
    };
  });
}

/* harmony default export */ __webpack_exports__["default"] = (Workouts);

/***/ })

})
//# sourceMappingURL=index.js.e982e5969d02eb0af8fa.hot-update.js.map