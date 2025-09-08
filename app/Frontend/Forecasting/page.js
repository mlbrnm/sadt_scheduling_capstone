"use client";

import DropDownMenus from "./dropDownMenus";

export default function Forecasting() {
  return (
    <div>
      <div className="flex justify-center items-end">
        <div className="px-10">
          <DropDownMenus />
        </div>
        {/*Next Button*/}
        <div>
          <button className="bg-red-800 hover:bg-red-700 rounded-sm text-white px-6 py-2">
            Next
          </button>
        </div>
      </div>
      <div className="flex justify-center mt-50">
        <h1 className="text-xl">
          Select a semester above to create scheduling templates
        </h1>
      </div>
    </div>
  );
}
