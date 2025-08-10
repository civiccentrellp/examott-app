import { useQuery } from '@tanstack/react-query';
import { getAllTests } from '@/utils/tests/test';

export const useAllTests = () => {
    return useQuery({
        queryKey: ['allTests'],
        queryFn: getAllTests,
    });
};
