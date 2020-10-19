webpackHotUpdate("main",{

/***/ "./src/ActiveLabel/index.tsx":
/*!***********************************!*\
  !*** ./src/ActiveLabel/index.tsx ***!
  \***********************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var react_redux__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react-redux */ "react-redux");
/* harmony import */ var react_redux__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react_redux__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _material_ui_core__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @material-ui/core */ "@material-ui/core");
/* harmony import */ var _material_ui_core__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_material_ui_core__WEBPACK_IMPORTED_MODULE_2__);



var useStyles = Object(_material_ui_core__WEBPACK_IMPORTED_MODULE_2__["makeStyles"])(function () {
    return Object(_material_ui_core__WEBPACK_IMPORTED_MODULE_2__["createStyles"])({
        labelDropDownOpen: {
            position: "relative",
            display: "flex",
            alignItems: "center",
            color: "var(--secondaryText)",
            fontSize: 12,
            fontWeight: 500,
            padding: "3.5px 6px 3.5px 8px",
            width: 160,
            cursor: "pointer",
        },
        labelDropDown: {
            position: "relative",
            display: "flex",
            alignItems: "center",
            color: "var(--secondaryText)",
            fontSize: 12,
            fontWeight: 500,
            padding: "3.5px 6px 3.5px 8px",
            width: 160,
            cursor: "pointer",
            "&:hover": {
                backgroundColor: "var(--highlight)",
                borderRadius: 4,
            },
        },
        cardOpen: {
            position: "absolute",
            top: "100%",
            left: 6,
            zIndex: 10,
            backgroundColor: "var(--secondaryBg)",
            maxHeight: "calc(80vh - 174px)",
            width: 185,
            borderRadius: "0 4px 4px 4px",
            overflow: "auto",
            boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.23), 0 4px 8px 3px rgba(0, 0, 0, 0.11)",
            border: "1px solid var(--dropDownBorder)",
        },
        card: {
            position: "absolute",
            top: "100%",
            left: 6,
            zIndex: 10,
            backgroundColor: "var(--secondaryBg)",
            maxHeight: "calc(80vh - 174px)",
            width: 185,
            borderRadius: "0 4px 4px 4px",
            overflow: "auto",
            boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.23), 0 4px 8px 3px rgba(0, 0, 0, 0.11)",
            border: "1px solid var(--dropDownBorder)",
            visibility: "hidden",
        },
        listItem: {
            padding: "10px 6px",
            overflow: "hidden",
            whiteSpace: "nowrap",
            textOverflow: "ellipsis",
            "&:hover": {
                backgroundColor: "var(--highlight)",
            },
        },
        editTextWrapperOpen: {
            fontFamily: '"ibm-plex-sans", Helvetica Neue, Arial, sans-serif',
            fontWeight: 500,
            fontSize: 12,
            color: "var(--brightText)",
            height: 19,
            width: 122,
            paddingLeft: 4,
            border: "none",
            outline: "none",
            marginRight: "auto",
            backgroundColor: "var(--textInput)",
            boxShadow: "0 0 0 2px var(--blue)",
        },
        editTextWrapper: {
            fontFamily: '"ibm-plex-sans", Helvetica Neue, Arial, sans-serif',
            fontWeight: 500,
            fontSize: 12,
            color: "var(--brightText)",
            height: 19,
            width: 122,
            paddingLeft: 4,
            border: "none",
            outline: "none",
            marginRight: "auto",
            backgroundColor: "transparent",
        },
        dropDownIcon: {
            fill: "var(--secondaryText)",
        },
    });
});
function ActiveLabel() {
    var classes = useStyles();
    var dispatch = useDispatch();
    var activeLabel = Object(react_redux__WEBPACK_IMPORTED_MODULE_1__["useSelector"])(function (state) { return state.activeLabel; });
    var labels = ["bloop", "soup"];
    // const [activeLabel, setActiveLabel] = useRecoilState(activeLabelState);
    // const labels = useRecoilValue(labelsState);
    var _a = Object(react__WEBPACK_IMPORTED_MODULE_0__["useState"])(false), labelOpen = _a[0], setLabelOpen = _a[1];
    var _b = Object(react__WEBPACK_IMPORTED_MODULE_0__["useState"])(undefined), labelEditingValue = _b[0], setEditingLabelValue = _b[1];
    var inputRef = Object(react__WEBPACK_IMPORTED_MODULE_0__["useRef"])(null);
    var ref = Object(react__WEBPACK_IMPORTED_MODULE_0__["useRef"])(null);
    // const handleBlur = useCallback(() => {
    //   setEditingLabelValue(undefined);
    //   setLabelOpen(false);
    // }, []);
    // useOnClickOutside(ref, handleBlur);
    Object(react__WEBPACK_IMPORTED_MODULE_0__["useEffect"])(function () {
        // calling this directly after setEditing doesn't work, which is why we need
        // to use and effect.
        if (labelOpen && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [labelOpen]);
    var handleChange = Object(react__WEBPACK_IMPORTED_MODULE_0__["useCallback"])(function (e) {
        setEditingLabelValue(e.target.value);
    }, []);
    var handleKeyPress = Object(react__WEBPACK_IMPORTED_MODULE_0__["useCallback"])(function (e) {
        // if (e.key === "Enter") {
        //   const newActiveLabel = inputRef.current.value.trim();
        //   if (newActiveLabel) {
        //     if (!labels.includes(newActiveLabel)) {
        //       syncAction(createLabel, [newActiveLabel]);
        //     }
        //     setActiveLabel(newActiveLabel);
        //   }
        //   setEditingLabelValue(undefined);
        //   setLabelOpen(false);
        // }
    }, []);
    var handleClick = Object(react__WEBPACK_IMPORTED_MODULE_0__["useCallback"])(function () {
        setLabelOpen(true);
    }, []);
    var handleLabelChosen = Object(react__WEBPACK_IMPORTED_MODULE_0__["useCallback"])(function (label) { return function (e) {
        e.stopPropagation();
        // @ts-ignore
        dispatch({
            type: "active-label/set",
            payload: label,
        });
        setEditingLabelValue(undefined);
        setLabelOpen(false);
    }; }, []);
    var query = (labelEditingValue || "").trim();
    var filteredLabels = query === ""
        ? labels
        : labels
            // If the query is at the begining of the label.
            .filter(function (item) { return item.toLowerCase().indexOf(query.toLowerCase()) === 0; })
            // Only sort the list when we filter, to make it easier to see diff.
            .sort(function (a, b) { return a.length - b.length; });
    return (react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("div", { ref: ref, onClick: handleClick, className: labelOpen ? classes.labelDropDownOpen : classes.labelDropDown },
        filteredLabels.length > 0 && (react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("div", { className: labelOpen ? classes.cardOpen : classes.card }, filteredLabels.map(function (label) { return (react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("div", { className: classes.listItem, key: label, onClick: handleLabelChosen(label) }, label)); }))),
        react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("input", { ref: inputRef, className: labelOpen ? classes.editTextWrapperOpen : classes.editTextWrapper, readOnly: !labelOpen, 
            // disabled={!labelOpen} this causes issues in FireFox
            onChange: handleChange, onKeyPress: handleKeyPress, 
            // We need to use undefined because an empty string is falsy
            value: labelEditingValue !== undefined
                ? labelEditingValue
                : activeLabel || "" // If active label happens to be undefined the component will become uncontrolled.
            , type: "text" }),
        react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("svg", { className: classes.dropDownIcon, focusable: "false", preserveAspectRatio: "xMidYMid meet", width: "12", height: "12", viewBox: "0 0 16 16", "aria-hidden": "true" },
            react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("path", { d: "M8 11L3 6l.7-.7L8 9.6l4.3-4.3.7.7z" }))));
}
/* harmony default export */ __webpack_exports__["default"] = (ActiveLabel);


/***/ }),

/***/ "./src/index.tsx":
/*!***********************!*\
  !*** ./src/index.tsx ***!
  \***********************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _ActiveLabel__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./ActiveLabel */ "./src/ActiveLabel/index.tsx");
/* harmony import */ var _Counter__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./Counter */ "./src/Counter/index.tsx");



// import ActiveLabel from "./ActiveLabel";
var moveStyle = {
    fill: "white",
};
var boxStyle = {
    fill: "white",
    fillOpacity: 0.2,
    stroke: "white",
    strokeWidth: 2,
};
var BoxToolPlugin = {
    activate: function (iris) {
        iris.tools.register({
            id: "move",
            priority: 100,
            icon: (react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("svg", { style: moveStyle, width: "20", height: "20", viewBox: "0 0 40 40" },
                react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("path", { d: "M19,11h2V29H19V11Zm-8,8H29v2H11V19ZM21,35H19l-4-6H25ZM35,19v2l-6,4V15ZM5,21V19l6-4V25ZM19,5h2l4,6H15Z" }))),
        });
        iris.tools.register({
            id: "box2",
            priority: 0,
            icon: (react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("svg", { style: boxStyle, width: "20", height: "20", viewBox: "0 0 40 40" },
                react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("rect", { x: "4", y: "2", width: "10", height: "10" }))),
        });
        var boxTool = iris.tools.register({
            id: "box",
            icon: (react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("svg", { style: boxStyle, width: "20", height: "20", viewBox: "0 0 40 40" },
                react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("rect", { x: "4", y: "8", width: "32", height: "24" }))),
        });
        boxTool.options.register({
            component: react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("div", null, "bye"),
        });
        boxTool.options.register({
            component: react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("div", null, "hello world"),
            priority: 10,
        });
        boxTool.options.register({
            component: react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_Counter__WEBPACK_IMPORTED_MODULE_2__["default"], null),
            priority: 12,
        });
        boxTool.options.register({
            component: react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_ActiveLabel__WEBPACK_IMPORTED_MODULE_1__["default"], null),
            priority: 100,
        });
        boxTool.options.register({
            component: react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("div", null, "hello world bloo"),
            priority: 9,
        });
    },
};
/* harmony default export */ __webpack_exports__["default"] = (BoxToolPlugin);


/***/ })

})
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vLi9zcmMvQWN0aXZlTGFiZWwvaW5kZXgudHN4Iiwid2VicGFjazovLy8uL3NyYy9pbmRleC50c3giXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQXdFO0FBRTlCO0FBRW1CO0FBRTdELElBQU0sU0FBUyxHQUFHLG9FQUFVLENBQUM7SUFDM0IsNkVBQVksQ0FBQztRQUNYLGlCQUFpQixFQUFFO1lBQ2pCLFFBQVEsRUFBRSxVQUFVO1lBQ3BCLE9BQU8sRUFBRSxNQUFNO1lBQ2YsVUFBVSxFQUFFLFFBQVE7WUFDcEIsS0FBSyxFQUFFLHNCQUFzQjtZQUM3QixRQUFRLEVBQUUsRUFBRTtZQUNaLFVBQVUsRUFBRSxHQUFHO1lBQ2YsT0FBTyxFQUFFLHFCQUFxQjtZQUM5QixLQUFLLEVBQUUsR0FBRztZQUNWLE1BQU0sRUFBRSxTQUFTO1NBQ2xCO1FBQ0QsYUFBYSxFQUFFO1lBQ2IsUUFBUSxFQUFFLFVBQVU7WUFDcEIsT0FBTyxFQUFFLE1BQU07WUFDZixVQUFVLEVBQUUsUUFBUTtZQUNwQixLQUFLLEVBQUUsc0JBQXNCO1lBQzdCLFFBQVEsRUFBRSxFQUFFO1lBQ1osVUFBVSxFQUFFLEdBQUc7WUFDZixPQUFPLEVBQUUscUJBQXFCO1lBQzlCLEtBQUssRUFBRSxHQUFHO1lBQ1YsTUFBTSxFQUFFLFNBQVM7WUFDakIsU0FBUyxFQUFFO2dCQUNULGVBQWUsRUFBRSxrQkFBa0I7Z0JBQ25DLFlBQVksRUFBRSxDQUFDO2FBQ2hCO1NBQ0Y7UUFDRCxRQUFRLEVBQUU7WUFDUixRQUFRLEVBQUUsVUFBVTtZQUNwQixHQUFHLEVBQUUsTUFBTTtZQUNYLElBQUksRUFBRSxDQUFDO1lBQ1AsTUFBTSxFQUFFLEVBQUU7WUFDVixlQUFlLEVBQUUsb0JBQW9CO1lBQ3JDLFNBQVMsRUFBRSxvQkFBb0I7WUFDL0IsS0FBSyxFQUFFLEdBQUc7WUFDVixZQUFZLEVBQUUsZUFBZTtZ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LEdBQUc7U0FDZCxDQUFDLENBQUM7UUFFSCxPQUFPLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQztZQUN2QixTQUFTLEVBQUUsMkZBQTJCO1lBQ3RDLFFBQVEsRUFBRSxDQUFDO1NBQ1osQ0FBQyxDQUFDO0lBQ0wsQ0FBQztDQUNGLENBQUM7QUFFYSw0RUFBYSxFQUFDIiwiZmlsZSI6Im1haW4uYzExNDEwYzJiYzAzODE4MDVmZjkuaG90LXVwZGF0ZS5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBSZWFjdCwgeyB1c2VTdGF0ZSwgdXNlQ2FsbGJhY2ssIHVzZUVmZmVjdCwgdXNlUmVmIH0gZnJvbSBcInJlYWN0XCI7XG5cbmltcG9ydCB7IHVzZVNlbGVjdG9yIH0gZnJvbSBcInJlYWN0LXJlZHV4XCI7XG5cbmltcG9ydCB7IGNyZWF0ZVN0eWxlcywgbWFrZVN0eWxlcyB9IGZyb20gXCJAbWF0ZXJpYWwtdWkvY29yZVwiO1xuXG5jb25zdCB1c2VTdHlsZXMgPSBtYWtlU3R5bGVzKCgpID0+XG4gIGNyZWF0ZVN0eWxlcyh7XG4gICAgbGFiZWxEcm9wRG93bk9wZW46IHtcbiAgICAgIHBvc2l0aW9uOiBcInJlbGF0aXZlXCIsXG4gICAgICBkaXNwbGF5OiBcImZsZXhcIixcbiAgICAgIGFsaWduSXRlbXM6IFwiY2VudGVyXCIsXG4gICAgICBjb2xvcjogXCJ2YXIoLS1zZWNvbmRhcnlUZXh0KVwiLFxuICAgICAgZm9udFNpemU6IDEyLFxuICAgICAgZm9udFdlaWdodDogNTAwLFxuICAgICAgcGFkZGluZzogXCIzLjVweCA2cHggMy41cHggOHB4XCIsXG4gICAgICB3aWR0aDogMTYwLFxuICAgICAgY3Vyc29yOiBcInBvaW50ZXJcIixcbiAgICB9LFxuICAgIGxhYmVsRHJvcERvd246IHtcbiAgICAgIHBvc2l0aW9uOiBcInJlbGF0aXZlXCIsXG4gICAgICBkaXNwbGF5OiBcImZsZXhcIixcbiAgICAgIGFsaWduSXRlbXM6IFwiY2VudGVyXCIsXG4gICAgICBjb2xvcjogXCJ2YXIoLS1zZWNvbmRhcnlUZXh0KVwiLFxuICAgICAgZm9udFNpemU6IDEyLFxuICAgICAgZm9udFdlaWdodDogNTAwLFxuICAgICAgcGFkZGluZzogXCIzLjVweCA2cHggMy41cHggOHB4XCIsXG4gICAgICB3aWR0aDogMTYwLFxuICAgICAgY3Vyc29yOiBcInBvaW50ZXJcIixcbiAgICAgIFwiJjpob3ZlclwiOiB7XG4gICAgICAgIGJhY2tncm91bmRDb2xvcjogXCJ2YXIoLS1oaWdobGlnaHQpXCIsXG4gICAgICAgIGJvcmRlclJhZGl1czogNCxcbiAgICAgIH0sXG4gICAgfSxcbiAgICBjYXJkT3Blbjoge1xuICAgICAgcG9zaXRpb246IFwiYWJzb2x1dGVcIixcbiAgICAgIHRvcDogXCIxMDAlXCIsXG4gICAgICBsZWZ0OiA2LFxuICAgICAgekluZGV4OiAxMCxcbiAgICAgIGJhY2tncm91bmRDb2xvcjogXCJ2YXIoLS1zZWNvbmRhcnlCZylcIixcbiAgICAgIG1heEhlaWdodDogXCJjYWxjKDgwdmggLSAxNzRweClcIixcbiAgICAgIHdpZHRoOiAxODUsXG4gICAgICBib3JkZXJSYWRpdXM6IFwiMCA0cHggNHB4IDRweFwiLFxuICAgICAgb3ZlcmZsb3c6IFwiYXV0b1wiLFxuICAgICAgYm94U2hhZG93OlxuICAgICAgICBcIjAgMXB4IDNweCAwIHJnYmEoMCwgMCwgMCwgMC4yMyksIDAgNHB4IDhweCAzcHggcmdiYSgwLCAwLCAwLCAwLjExKVwiLFxuICAgICAgYm9yZGVyOiBcIjFweCBzb2xpZCB2YXIoLS1kcm9wRG93bkJvcmRlcilcIixcbiAgICB9LFxuICAgIGNhcmQ6IHtcbiAgICAgIHBvc2l0aW9uOiBcImFic29sdXRlXCIsXG4gICAgICB0b3A6IFwiMTAwJVwiLFxuICAgICAgbGVmdDogNixcbiAgICAgIHpJbmRleDogMTAsXG4gICAgICBiYWNrZ3JvdW5kQ29sb3I6IFwidmFyKC0tc2Vjb25kYXJ5QmcpXCIsXG4gICAgICBtYXhIZWlnaHQ6IFwiY2FsYyg4MHZoIC0gMTc0cHgpXCIsXG4gICAgICB3aWR0aDogMTg1LFxuICAgICAgYm9yZGVyUmFkaXVzOiBcIjAgNHB4IDRweCA0cHhcIixcbiAgICAgIG92ZXJmbG93OiBcImF1dG9cIixcbiAgICAgIGJveFNoYWRvdzpcbiAgICAgICAgXCIwIDFweCAzcHggMCByZ2JhKDAsIDAsIDAsIDAuMjMpLCAwIDRweCA4cHggM3B4IHJnYmEoMCwgMCwgMCwgMC4xMSlcIixcbiAgICAgIGJvcmRlcjogXCIxcHggc29saWQgdmFyKC0tZHJvcERvd25Cb3JkZXIpXCIsXG4gICAgICB2aXNpYmlsaXR5OiBcImhpZGRlblwiLFxuICAgIH0sXG4gICAgbGlzdEl0ZW06IHtcbiAgICAgIHBhZGRpbmc6IFwiMTBweCA2cHhcIixcbiAgICAgIG92ZXJmbG93OiBcImhpZGRlblwiLFxuICAgICAgd2hpdGVTcGFjZTogXCJub3dyYXBcIixcbiAgICAgIHRleHRPdmVyZmxvdzogXCJlbGxpcHNpc1wiLFxuICAgICAgXCImOmhvdmVyXCI6IHtcbiAgICAgICAgYmFja2dyb3VuZENvbG9yOiBcInZhcigtLWhpZ2hsaWdodClcIixcbiAgICAgIH0sXG4gICAgfSxcbiAgICBlZGl0VGV4dFdyYXBwZXJPcGVuOiB7XG4gICAgICBmb250RmFtaWx5OiAnXCJpYm0tcGxleC1zYW5zXCIsIEhlbHZldGljYSBOZXVlLCBBcmlhbCwgc2Fucy1zZXJpZicsXG4gICAgICBmb250V2VpZ2h0OiA1MDAsXG4gICAgICBmb250U2l6ZTogMTIsXG4gICAgICBjb2xvcjogXCJ2YXIoLS1icmlnaHRUZXh0KVwiLFxuICAgICAgaGVpZ2h0OiAxOSxcbiAgICAgIHdpZHRoOiAxMjIsXG4gICAgICBwYWRkaW5nTGVmdDogNCxcbiAgICAgIGJvcmRlcjogXCJub25lXCIsXG4gICAgICBvdXRsaW5lOiBcIm5vbmVcIixcbiAgICAgIG1hcmdpblJpZ2h0OiBcImF1dG9cIixcbiAgICAgIGJhY2tncm91bmRDb2xvcjogXCJ2YXIoLS10ZXh0SW5wdXQpXCIsXG4gICAgICBib3hTaGFkb3c6IFwiMCAwIDAgMnB4IHZhcigtLWJsdWUpXCIsXG4gICAgfSxcbiAgICBlZGl0VGV4dFdyYXBwZXI6IHtcbiAgICAgIGZvbnRGYW1pbHk6ICdcImlibS1wbGV4LXNhbnNcIiwgSGVsdmV0aWNhIE5ldWUsIEFyaWFsLCBzYW5zLXNlcmlmJyxcbiAgICAgIGZvbnRXZWlnaHQ6IDUwMCxcbiAgICAgIGZvbnRTaXplOiAxMixcbiAgICAgIGNvbG9yOiBcInZhcigtLWJyaWdodFRleHQpXCIsXG4gICAgICBoZWlnaHQ6IDE5LFxuICAgICAgd2lkdGg6IDEyMixcbiAgICAgIHBhZGRpbmdMZWZ0OiA0LFxuICAgICAgYm9yZGVyOiBcIm5vbmVcIixcbiAgICAgIG91dGxpbmU6IFwibm9uZVwiLFxuICAgICAgbWFyZ2luUmlnaHQ6IFwiYXV0b1wiLFxuICAgICAgYmFja2dyb3VuZENvbG9yOiBcInRyYW5zcGFyZW50XCIsXG4gICAgfSxcbiAgICBkcm9wRG93bkljb246IHtcbiAgICAgIGZpbGw6IFwidmFyKC0tc2Vjb25kYXJ5VGV4dClcIixcbiAgICB9LFxuICB9KVxuKTtcblxuZnVuY3Rpb24gQWN0aXZlTGFiZWwoKSB7XG4gIGNvbnN0IGNsYXNzZXMgPSB1c2VTdHlsZXMoKTtcblxuICBjb25zdCBkaXNwYXRjaCA9IHVzZURpc3BhdGNoKCk7XG4gIGNvbnN0IGFjdGl2ZUxhYmVsID0gdXNlU2VsZWN0b3IoKHN0YXRlOiBhbnkpID0+IHN0YXRlLmFjdGl2ZUxhYmVsKTtcblxuICBsZXQgbGFiZWxzID0gW1wiYmxvb3BcIiwgXCJzb3VwXCJdO1xuICAvLyBjb25zdCBbYWN0aXZlTGFiZWwsIHNldEFjdGl2ZUxhYmVsXSA9IHVzZVJlY29pbFN0YXRlKGFjdGl2ZUxhYmVsU3RhdGUpO1xuICAvLyBjb25zdCBsYWJlbHMgPSB1c2VSZWNvaWxWYWx1ZShsYWJlbHNTdGF0ZSk7XG4gIGNvbnN0IFtsYWJlbE9wZW4sIHNldExhYmVsT3Blbl0gPSB1c2VTdGF0ZShmYWxzZSk7XG4gIGNvbnN0IFtsYWJlbEVkaXRpbmdWYWx1ZSwgc2V0RWRpdGluZ0xhYmVsVmFsdWVdID0gdXNlU3RhdGUodW5kZWZpbmVkKTtcblxuICBjb25zdCBpbnB1dFJlZiA9IHVzZVJlZjxIVE1MSW5wdXRFbGVtZW50PihudWxsKTtcblxuICBjb25zdCByZWYgPSB1c2VSZWYobnVsbCk7XG4gIC8vIGNvbnN0IGhhbmRsZUJsdXIgPSB1c2VDYWxsYmFjaygoKSA9PiB7XG4gIC8vICAgc2V0RWRpdGluZ0xhYmVsVmFsdWUodW5kZWZpbmVkKTtcbiAgLy8gICBzZXRMYWJlbE9wZW4oZmFsc2UpO1xuICAvLyB9LCBbXSk7XG4gIC8vIHVzZU9uQ2xpY2tPdXRzaWRlKHJlZiwgaGFuZGxlQmx1cik7XG5cbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICAvLyBjYWxsaW5nIHRoaXMgZGlyZWN0bHkgYWZ0ZXIgc2V0RWRpdGluZyBkb2Vzbid0IHdvcmssIHdoaWNoIGlzIHdoeSB3ZSBuZWVkXG4gICAgLy8gdG8gdXNlIGFuZCBlZmZlY3QuXG4gICAgaWYgKGxhYmVsT3BlbiAmJiBpbnB1dFJlZi5jdXJyZW50KSB7XG4gICAgICBpbnB1dFJlZi5jdXJyZW50LmZvY3VzKCk7XG4gICAgICBpbnB1dFJlZi5jdXJyZW50LnNlbGVjdCgpO1xuICAgIH1cbiAgfSwgW2xhYmVsT3Blbl0pO1xuXG4gIGNvbnN0IGhhbmRsZUNoYW5nZSA9IHVzZUNhbGxiYWNrKChlKSA9PiB7XG4gICAgc2V0RWRpdGluZ0xhYmVsVmFsdWUoZS50YXJnZXQudmFsdWUpO1xuICB9LCBbXSk7XG5cbiAgY29uc3QgaGFuZGxlS2V5UHJlc3MgPSB1c2VDYWxsYmFjaygoZSkgPT4ge1xuICAgIC8vIGlmIChlLmtleSA9PT0gXCJFbnRlclwiKSB7XG4gICAgLy8gICBjb25zdCBuZXdBY3RpdmVMYWJlbCA9IGlucHV0UmVmLmN1cnJlbnQudmFsdWUudHJpbSgpO1xuICAgIC8vICAgaWYgKG5ld0FjdGl2ZUxhYmVsKSB7XG4gICAgLy8gICAgIGlmICghbGFiZWxzLmluY2x1ZGVzKG5ld0FjdGl2ZUxhYmVsKSkge1xuICAgIC8vICAgICAgIHN5bmNBY3Rpb24oY3JlYXRlTGFiZWwsIFtuZXdBY3RpdmVMYWJlbF0pO1xuICAgIC8vICAgICB9XG4gICAgLy8gICAgIHNldEFjdGl2ZUxhYmVsKG5ld0FjdGl2ZUxhYmVsKTtcbiAgICAvLyAgIH1cbiAgICAvLyAgIHNldEVkaXRpbmdMYWJlbFZhbHVlKHVuZGVmaW5lZCk7XG4gICAgLy8gICBzZXRMYWJlbE9wZW4oZmFsc2UpO1xuICAgIC8vIH1cbiAgfSwgW10pO1xuXG4gIGNvbnN0IGhhbmRsZUNsaWNrID0gdXNlQ2FsbGJhY2soKCkgPT4ge1xuICAgIHNldExhYmVsT3Blbih0cnVlKTtcbiAgfSwgW10pO1xuXG4gIGNvbnN0IGhhbmRsZUxhYmVsQ2hvc2VuID0gdXNlQ2FsbGJhY2soXG4gICAgKGxhYmVsKSA9PiAoZTogYW55KSA9PiB7XG4gICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgZGlzcGF0Y2goe1xuICAgICAgICB0eXBlOiBcImFjdGl2ZS1sYWJlbC9zZXRcIixcbiAgICAgICAgcGF5bG9hZDogbGFiZWwsXG4gICAgICB9KTtcbiAgICAgIHNldEVkaXRpbmdMYWJlbFZhbHVlKHVuZGVmaW5lZCk7XG4gICAgICBzZXRMYWJlbE9wZW4oZmFsc2UpO1xuICAgIH0sXG4gICAgW11cbiAgKTtcblxuICBjb25zdCBxdWVyeSA9IChsYWJlbEVkaXRpbmdWYWx1ZSB8fCBcIlwiKS50cmltKCk7XG4gIGNvbnN0IGZpbHRlcmVkTGFiZWxzID1cbiAgICBxdWVyeSA9PT0gXCJcIlxuICAgICAgPyBsYWJlbHNcbiAgICAgIDogbGFiZWxzXG4gICAgICAgICAgLy8gSWYgdGhlIHF1ZXJ5IGlzIGF0IHRoZSBiZWdpbmluZyBvZiB0aGUgbGFiZWwuXG4gICAgICAgICAgLmZpbHRlcihcbiAgICAgICAgICAgIChpdGVtOiBhbnkpID0+IGl0ZW0udG9Mb3dlckNhc2UoKS5pbmRleE9mKHF1ZXJ5LnRvTG93ZXJDYXNlKCkpID09PSAwXG4gICAgICAgICAgKVxuICAgICAgICAgIC8vIE9ubHkgc29ydCB0aGUgbGlzdCB3aGVuIHdlIGZpbHRlciwgdG8gbWFrZSBpdCBlYXNpZXIgdG8gc2VlIGRpZmYuXG4gICAgICAgICAgLnNvcnQoKGE6IGFueSwgYjogYW55KSA9PiBhLmxlbmd0aCAtIGIubGVuZ3RoKTtcblxuICByZXR1cm4gKFxuICAgIDxkaXZcbiAgICAgIHJlZj17cmVmfVxuICAgICAgb25DbGljaz17aGFuZGxlQ2xpY2t9XG4gICAgICBjbGFzc05hbWU9e2xhYmVsT3BlbiA/IGNsYXNzZXMubGFiZWxEcm9wRG93bk9wZW4gOiBjbGFzc2VzLmxhYmVsRHJvcERvd259XG4gICAgPlxuICAgICAge2ZpbHRlcmVkTGFiZWxzLmxlbmd0aCA+IDAgJiYgKFxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT17bGFiZWxPcGVuID8gY2xhc3Nlcy5jYXJkT3BlbiA6IGNsYXNzZXMuY2FyZH0+XG4gICAgICAgICAge2ZpbHRlcmVkTGFiZWxzLm1hcCgobGFiZWw6IGFueSkgPT4gKFxuICAgICAgICAgICAgPGRpdlxuICAgICAgICAgICAgICBjbGFzc05hbWU9e2NsYXNzZXMubGlzdEl0ZW19XG4gICAgICAgICAgICAgIGtleT17bGFiZWx9XG4gICAgICAgICAgICAgIG9uQ2xpY2s9e2hhbmRsZUxhYmVsQ2hvc2VuKGxhYmVsKX1cbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAge2xhYmVsfVxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgKSl9XG4gICAgICAgIDwvZGl2PlxuICAgICAgKX1cbiAgICAgIDxpbnB1dFxuICAgICAgICByZWY9e2lucHV0UmVmfVxuICAgICAgICBjbGFzc05hbWU9e1xuICAgICAgICAgIGxhYmVsT3BlbiA/IGNsYXNzZXMuZWRpdFRleHRXcmFwcGVyT3BlbiA6IGNsYXNzZXMuZWRpdFRleHRXcmFwcGVyXG4gICAgICAgIH1cbiAgICAgICAgcmVhZE9ubHk9eyFsYWJlbE9wZW59XG4gICAgICAgIC8vIGRpc2FibGVkPXshbGFiZWxPcGVufSB0aGlzIGNhdXNlcyBpc3N1ZXMgaW4gRmlyZUZveFxuICAgICAgICBvbkNoYW5nZT17aGFuZGxlQ2hhbmdlfVxuICAgICAgICBvbktleVByZXNzPXtoYW5kbGVLZXlQcmVzc31cbiAgICAgICAgLy8gV2UgbmVlZCB0byB1c2UgdW5kZWZpbmVkIGJlY2F1c2UgYW4gZW1wdHkgc3RyaW5nIGlzIGZhbHN5XG4gICAgICAgIHZhbHVlPXtcbiAgICAgICAgICBsYWJlbEVkaXRpbmdWYWx1ZSAhPT0gdW5kZWZpbmVkXG4gICAgICAgICAgICA/IGxhYmVsRWRpdGluZ1ZhbHVlXG4gICAgICAgICAgICA6IGFjdGl2ZUxhYmVsIHx8IFwiXCIgLy8gSWYgYWN0aXZlIGxhYmVsIGhhcHBlbnMgdG8gYmUgdW5kZWZpbmVkIHRoZSBjb21wb25lbnQgd2lsbCBiZWNvbWUgdW5jb250cm9sbGVkLlxuICAgICAgICB9XG4gICAgICAgIHR5cGU9XCJ0ZXh0XCJcbiAgICAgIC8+XG4gICAgICA8c3ZnXG4gICAgICAgIGNsYXNzTmFtZT17Y2xhc3Nlcy5kcm9wRG93bkljb259XG4gICAgICAgIGZvY3VzYWJsZT1cImZhbHNlXCJcbiAgICAgICAgcHJlc2VydmVBc3BlY3RSYXRpbz1cInhNaWRZTWlkIG1lZXRcIlxuICAgICAgICB3aWR0aD1cIjEyXCJcbiAgICAgICAgaGVpZ2h0PVwiMTJcIlxuICAgICAgICB2aWV3Qm94PVwiMCAwIDE2IDE2XCJcbiAgICAgICAgYXJpYS1oaWRkZW49XCJ0cnVlXCJcbiAgICAgID5cbiAgICAgICAgPHBhdGggZD1cIk04IDExTDMgNmwuNy0uN0w4IDkuNmw0LjMtNC4zLjcuN3pcIiAvPlxuICAgICAgPC9zdmc+XG4gICAgPC9kaXY+XG4gICk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IEFjdGl2ZUxhYmVsO1xuIiwiaW1wb3J0IFJlYWN0IGZyb20gXCJyZWFjdFwiO1xuaW1wb3J0IEFjdGl2ZUxhYmVsIGZyb20gXCIuL0FjdGl2ZUxhYmVsXCI7XG5pbXBvcnQgQ291bnRlciBmcm9tIFwiLi9Db3VudGVyXCI7XG4vLyBpbXBvcnQgQWN0aXZlTGFiZWwgZnJvbSBcIi4vQWN0aXZlTGFiZWxcIjtcblxuY29uc3QgbW92ZVN0eWxlID0ge1xuICBmaWxsOiBcIndoaXRlXCIsXG59O1xuXG5jb25zdCBib3hTdHlsZSA9IHtcbiAgZmlsbDogXCJ3aGl0ZVwiLFxuICBmaWxsT3BhY2l0eTogMC4yLFxuICBzdHJva2U6IFwid2hpdGVcIixcbiAgc3Ryb2tlV2lkdGg6IDIsXG59O1xuXG5jb25zdCBCb3hUb29sUGx1Z2luID0ge1xuICBhY3RpdmF0ZShpcmlzOiBhbnkpIHtcbiAgICBpcmlzLnRvb2xzLnJlZ2lzdGVyKHtcbiAgICAgIGlkOiBcIm1vdmVcIixcbiAgICAgIHByaW9yaXR5OiAxMDAsXG4gICAgICBpY29uOiAoXG4gICAgICAgIDxzdmcgc3R5bGU9e21vdmVTdHlsZX0gd2lkdGg9XCIyMFwiIGhlaWdodD1cIjIwXCIgdmlld0JveD1cIjAgMCA0MCA0MFwiPlxuICAgICAgICAgIDxwYXRoIGQ9XCJNMTksMTFoMlYyOUgxOVYxMVptLTgsOEgyOXYySDExVjE5Wk0yMSwzNUgxOWwtNC02SDI1Wk0zNSwxOXYybC02LDRWMTVaTTUsMjFWMTlsNi00VjI1Wk0xOSw1aDJsNCw2SDE1WlwiIC8+XG4gICAgICAgIDwvc3ZnPlxuICAgICAgKSxcbiAgICB9KTtcblxuICAgIGlyaXMudG9vbHMucmVnaXN0ZXIoe1xuICAgICAgaWQ6IFwiYm94MlwiLFxuICAgICAgcHJpb3JpdHk6IDAsXG4gICAgICBpY29uOiAoXG4gICAgICAgIDxzdmcgc3R5bGU9e2JveFN0eWxlfSB3aWR0aD1cIjIwXCIgaGVpZ2h0PVwiMjBcIiB2aWV3Qm94PVwiMCAwIDQwIDQwXCI+XG4gICAgICAgICAgPHJlY3QgeD1cIjRcIiB5PVwiMlwiIHdpZHRoPVwiMTBcIiBoZWlnaHQ9XCIxMFwiIC8+XG4gICAgICAgIDwvc3ZnPlxuICAgICAgKSxcbiAgICB9KTtcblxuICAgIGNvbnN0IGJveFRvb2wgPSBpcmlzLnRvb2xzLnJlZ2lzdGVyKHtcbiAgICAgIGlkOiBcImJveFwiLFxuICAgICAgaWNvbjogKFxuICAgICAgICA8c3ZnIHN0eWxlPXtib3hTdHlsZX0gd2lkdGg9XCIyMFwiIGhlaWdodD1cIjIwXCIgdmlld0JveD1cIjAgMCA0MCA0MFwiPlxuICAgICAgICAgIDxyZWN0IHg9XCI0XCIgeT1cIjhcIiB3aWR0aD1cIjMyXCIgaGVpZ2h0PVwiMjRcIiAvPlxuICAgICAgICA8L3N2Zz5cbiAgICAgICksXG4gICAgfSk7XG5cbiAgICBib3hUb29sLm9wdGlvbnMucmVnaXN0ZXIoe1xuICAgICAgY29tcG9uZW50OiA8ZGl2PmJ5ZTwvZGl2PixcbiAgICB9KTtcblxuICAgIGJveFRvb2wub3B0aW9ucy5yZWdpc3Rlcih7XG4gICAgICBjb21wb25lbnQ6IDxkaXY+aGVsbG8gd29ybGQ8L2Rpdj4sXG4gICAgICBwcmlvcml0eTogMTAsXG4gICAgfSk7XG5cbiAgICBib3hUb29sLm9wdGlvbnMucmVnaXN0ZXIoe1xuICAgICAgY29tcG9uZW50OiA8Q291bnRlciAvPixcbiAgICAgIHByaW9yaXR5OiAxMixcbiAgICB9KTtcblxuICAgIGJveFRvb2wub3B0aW9ucy5yZWdpc3Rlcih7XG4gICAgICBjb21wb25lbnQ6IDxBY3RpdmVMYWJlbCAvPixcbiAgICAgIHByaW9yaXR5OiAxMDAsXG4gICAgfSk7XG5cbiAgICBib3hUb29sLm9wdGlvbnMucmVnaXN0ZXIoe1xuICAgICAgY29tcG9uZW50OiA8ZGl2PmhlbGxvIHdvcmxkIGJsb288L2Rpdj4sXG4gICAgICBwcmlvcml0eTogOSxcbiAgICB9KTtcbiAgfSxcbn07XG5cbmV4cG9ydCBkZWZhdWx0IEJveFRvb2xQbHVnaW47XG4iXSwic291cmNlUm9vdCI6IiJ9