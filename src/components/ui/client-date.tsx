"use client";

import { useEffect, useState } from 'react';

type ClientDateProps = {
  dateString: string;
};

export function ClientDate({ dateString }: ClientDateProps) {
  const [formattedDate, setFormattedDate] = useState('');

  useEffect(() => {
    setFormattedDate(new Date(dateString).toLocaleString());
}, [dateString]);

  return <time dateTime={dateString}>{formattedDate}</time>;
}
