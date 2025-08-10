import React, { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function AddSectionModal({
  onClose,
  onAdd,
  allowNegative,
  sectionData,
}: {
  onClose: () => void;
  onAdd: (data: any) => void;
  allowNegative: boolean;
  sectionData?: {
    name: string;
    marksPerQn: number;
    negativeMarks?: number;
  };
}) {
  const [name, setName] = useState('');
  const [marksPerQn, setMarksPerQn] = useState('');
  const [negativeMarks, setNegativeMarks] = useState('');

  useEffect(() => {
    if (sectionData) {
      setName(sectionData.name || '');
      setMarksPerQn(sectionData.marksPerQn?.toString() || '');
      setNegativeMarks(sectionData.negativeMarks?.toString() || '');
    }
  }, [sectionData]);

  const handleAdd = () => {
    const sectionData: any = {
      name,
      marksPerQn: parseFloat(marksPerQn),
    };
    if (allowNegative) {
      sectionData.negativeMarks = parseFloat(negativeMarks);
    }
    onAdd(sectionData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 shadow-xl w-[40%] space-y-4">
        <h2 className="text-xl font-bold text-gray-800">Add Section</h2>
        <div className="flex items-center justify-between space-y-2 w-full">
          <label className="text-sm text-gray-800 w-50">Section Name</label>
          <Input value={name} className='' onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="flex items-center justify-between space-y-2 w-full">
          <label className="text-sm text-gray-800 w-50">Marks per Question</label>
          <Input
            type="number"
            value={marksPerQn}
            onChange={(e) => setMarksPerQn(e.target.value)}
            className="appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            onWheel={(e) => (e.target as HTMLInputElement).blur()}
          />
        </div>
        {allowNegative && (
          <div className="flex items-center justify-between space-y-2 w-full">
            <label className="text-sm text-gray-800 w-50">Negative Marks</label>
            <Input
              type="number"
              value={negativeMarks}
              onChange={(e) => setNegativeMarks(e.target.value)}
              className="appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              onWheel={(e) => (e.target as HTMLInputElement).blur()}
            />
          </div>
        )}
        <div className="flex items-center justify-between gap-2 pt-4">
          <Button variant="outline" className=" flex items-center w-50" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleAdd} className=" bg-gray-900 hover:bg-gray-700 text-white flex items-center w-50">
            Add Section
          </Button>
        </div>
      </div>
    </div>
  );
}
