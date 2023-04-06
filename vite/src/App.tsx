import React, {useState} from 'react'
import {Route, Routes} from "react-router-dom";
import IndexPage from "./pages";

function App() {

    return (
        <div className="App">
            <div>
                <Routes>
                    <Route path={`/`} element={<IndexPage/>}/>
                </Routes>
            </div>
        </div>
    )
}

export default App
