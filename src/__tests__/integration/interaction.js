import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

describe('UI 조작', () => {
    test('커핑폼 작성법 접속', async () => {
        const {findByText} = render(<App/>);

        let selector = await findByText('커핑폼 작성법');
        fireEvent.press(selector);

        const title = await findByText('How to');
        const heading = await findByText('Flavor');
        const furtherStudy = await findByText('관련 사이트');
        expect(title).toBeTruthy();
        expect(heading).toBeTruthy();
        expect(furtherStudy).toBeTruthy();
    });

    test('커핑폼 추가', async () => {
        const {findByText, findAllByText, findByTestId} = render(<MyCuppingForm/>);

        let forms = await findAllByText('내 커핑폼');
        const numOfPreviousForms = forms.length;

        let selector = await findByText('항목 추가하기');
        fireEvent.press(selector);

        const attributes = ['Aroma', 'Aftertaste', 'Acidity', 'Overall'];
        const measures = ['6.75', '7.25', '8', '8'];
        for (let i = 0; i < attributes.length; i++) {
            selector = await findByText(attributes[i]);
            const measureSelector = await findByTestId(measures[i]);
            fireEvent.press(selector);
            fireEvent.press(measureSelector);
        }

        selector = await findByText('Save');
        fireEvent.press(selector);

        forms = await findAllByText('내 커핑폼');
        expect(forms.length).toBeGreaterThan(numOfPreviousForms);
    });

    test('커핑폼 수정', async () => {
        const {findByText, findByTestId} = render(<MyCuppingForm/>);

        const targetForm = await findByText('내 커핑폼 2');
        fireEvent.press(targetForm);

        let selector = await findByText('수정');
        fireEvent.press(selector);

        const attributes = ['Fragrance', 'Flavor', 'Body', 'Uniformity', 'Sweetness'];
        const measures = ['7.5', '7.5', '7.25', '10', '10'];
        for (let i = 0; i < attributes.length; i++) {
            selector = await findByText(attributes[i]);
            const measureSelector = await findByTestId(measures[i]);
            fireEvent.press(selector);
            fireEvent.press(measureSelector);
        }

        selector = await findByText('Save');
        fireEvent.press(selector);

        selector = await findByText('수정');
        fireEvent.press(targetForm);
        fireEvent.press(selector);

        for (let i = 0;i < attributes.length; i++) {
            selector = await findByText(attributes[i]);
            fireEvent.press(selector);

            const measure = await findByText(measures[i]);
            expect(measure).toBeTruthy();
        }
    });

    test('커핑 폼 추천', async () => {
        const {findByText, findAllByText} = render(<MyCuppingForm/>);

        let selector = await findByText('내 커핑폼 2');
        fireEvent.press(selector);

        selector = await findByText('유사한 커핑폼 보기');
        fireEvent.press(selector);

        const forms = await findAllByText('추천');
        fireEvent.press(selector[0]);

        // 더 좋은 검사 방법이 있을 것
        expect(forms).toBeTruthy();
    });
});