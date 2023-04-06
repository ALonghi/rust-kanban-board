'use client';

import React from "react";

type TaskProps = {
    title: string;
};

export default function TaskCardTitled({
                                     title,
                                 }: //
                                     TaskProps) {
    return (
        <div
            className={`cursor-move relative flex items-start space-x-3 rounded-lg
            border-0 border-gray-300 bg-white px-4 py-4 shadow-md mt-3 max-w-full h-[5rem]
            `}
        >
            <div className={`relative flex w-full h-full`}>
                <div className={`relative flex flex-col justify-start items-start`}>
                    <p
                        className={`mr-auto ml-0 overflow-x-none
                        font-normal text-sm p-0 h-fit max-h-full`}
                    >
                        {title}
                    </p>

                </div>
            </div>
        </div>
    );
}
